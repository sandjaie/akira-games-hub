/**
 * Generates src/content/space/wikiFacts.ts by walking Simple English Wikipedia
 * categories.
 *
 *   node scripts/gen-wiki-facts.mjs
 *
 * This is the only source for Sky Science, Deep Space and Sun and Stars: there
 * is no number in a solar system database that explains why the sky is blue, so
 * those sections can only grow from prose.
 *
 * Build time, not runtime, for two reasons. Wikipedia rate-limits hard — this
 * script gets 429s at better than one request a second, and a child opening a
 * mission must never wait on a throttled crawl. And roughly three quarters of
 * pages produce nothing usable, so the crawl is mostly waste that should happen
 * once rather than on every visit.
 *
 * Results are cached under .cache/ so a re-run only fetches what is new.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const API = 'https://simple.wikipedia.org/w/api.php'
const SUMMARY = 'https://simple.wikipedia.org/api/rest_v1/page/summary/'
const UA = 'akira-games-hub/1.0 (children education; build script)'
const OUT = new URL('../src/content/space/wikiFacts.ts', import.meta.url)
const CACHE_DIR = new URL('../.cache/', import.meta.url)
const CACHE = new URL('wiki-summaries.json', CACHE_DIR)

const filters = JSON.parse(
  readFileSync(new URL('../src/content/kidFilters.json', import.meta.url), 'utf8'),
)
const NOT_FOR_KIDS = new RegExp(filters.notForKids, 'i')

const MAX_WORDS = 20
const MIN_WORDS = 5
const MAX_WORD_LENGTH = 12
const PER_PAGE = 2
const PAUSE_MS = 1200

/** Categories worth walking, per mission. Everything else is noise. */
const SECTIONS = {
  'sun-stars': ['Stars', 'Sun', 'Constellations'],
  'deep-space': ['Galaxies', 'Nebulae', 'Astronomical objects'],
  'sky-science': ['Light', 'Weather', 'Clouds', 'Atmosphere'],
  'space-rocks': ['Asteroids', 'Comets', 'Meteoroids'],
  planets: ['Planets', 'Solar System'],
  today: ['Space exploration', 'Spacecraft', 'Astronauts', 'Telescopes'],
}

const DEFAULT_ART = {
  'sun-stars': 'stars',
  'deep-space': 'galaxy',
  'sky-science': 'blue-sky',
  'space-rocks': 'asteroid-belt',
  planets: 'solar-system',
  today: 'rocket',
}

const ART_KEYWORDS = [
  [/\bsun\b|solar flare|sunspot/i, 'sun'],
  [/\bmoon\b|lunar/i, 'moon'],
  [/galaxy|galaxies|nebula/i, 'galaxy'],
  [/milky way/i, 'milky-way'],
  [/comet/i, 'comet'],
  [/asteroid/i, 'asteroid-belt'],
  [/meteor/i, 'meteor'],
  [/rainbow|prism|colour|color/i, 'rainbow-light'],
  [/rain|cloud|storm/i, 'raindrops'],
  [/sunset|sunrise|dusk|twilight/i, 'sunset'],
  [/\bsky\b|atmosphere|air/i, 'blue-sky'],
  [/telescope|hubble|webb/i, 'telescope'],
  [/astronaut|spacesuit|apollo/i, 'astronaut'],
  [/rocket|launch|spacecraft|probe|satellite/i, 'rocket'],
  [/\bstar|constellation/i, 'stars'],
]

/**
 * Single-word titles are almost always a proper noun a child has never met —
 * AG Carinae, Albireo, Blazar, Fobos-Grunt. The exceptions are the core
 * concepts, which are exactly the pages worth having.
 */
const CORE_CONCEPTS = new Set([
  'Galaxy', 'Star', 'Light', 'Weather', 'Rainbow', 'Moon', 'Comet', 'Asteroid',
  'Nebula', 'Sun', 'Cloud', 'Clouds', 'Snow', 'Rain', 'Wind', 'Aurora',
  'Eclipse', 'Gravity', 'Telescope', 'Astronaut', 'Rocket', 'Satellite',
  'Planet', 'Universe', 'Constellation', 'Meteor', 'Meteorite', 'Sunlight',
  'Sunset', 'Sunrise', 'Thunder', 'Lightning', 'Fog', 'Frost', 'Sky',
  'Darkness', 'Shadow', 'Colour', 'Color', 'Season', 'Seasons', 'Atmosphere',
  'Spacecraft', 'Spacesuit', 'Orbit', 'Solstice', 'Equinox',
])

/**
 * Some categories are broader than the section they feed. Category:Light is a
 * physics-lab category — it gave Sky Science a free-electron laser and a
 * fluorescence microscope, both perfectly readable and both nothing to do with
 * the sky. Relevance is not something the readability filter can see.
 */
const RELEVANCE = {
  'sky-science': {
    want: /\b(sky|cloud|rain|rainbow|snow|storm|wind|weather|sunset|sunrise|sunlight|daylight|air|atmosphere|season|fog|frost|thunder|lightning|aurora|halo|mirage|shadow|colou?r|dark|night|day)\b/i,
    avoid: /\b(laser|microscope|electron|photon|semiconductor|birefring|diode|luminescen|fluoresc|doppler|redshift|blueshift|index|microscopy|spectro)\b/i,
  },
  'deep-space': {
    want: /\b(galaxy|galaxies|star|stars|space|universe|nebula|black hole|milky way)\b/i,
    avoid: /\b(lensing|blazar|quasar|disc|redshift|baryon|luminosity)\b/i,
  },
  'space-rocks': {
    want: /\b(asteroid|comet|meteor|rock|ice|crater|impact)\b/i,
    avoid: /\b(classificat|taxonom|Amor|Apollo asteroid|crosser)\b/i,
  },
  today: {
    want: /\b(astronaut|rocket|spacecraft|space station|telescope|satellite|launch|mission|orbit)\b/i,
    avoid: /\b(prototype|cancelled|proposed|concept study)\b/i,
  },
}

/**
 * Named individually because no pattern catches them and they are still wrong.
 * This is the curation artifact: when a rule cannot express "a six-year-old
 * does not need this", the honest thing is a list somebody signed off.
 *   Meitei mythology figures arrive via Category:Sun.
 *   Sun tanning is in Category:Sun and is not about the sky.
 *   The rest are measurements and stellar physics, readable but inert.
 */
const REJECT = new Set([
  'Tauhuireng Ahanpa',
  'Numitsana Khomadon',
  'Sun tanning',
  'Solar luminosity',
  'Solar radius',
  'Stellar population',
  'Stellar atmosphere',
  'Blue supergiant',
  'Failed supernova',
  'La Superba',
  'Van Allen radiation belt',
  'Ghost light',
  'Satellite flare',
  'Structural color',
  'Self-replicating spacecraft',
  'Spacecraft propulsion',
  'Most distant things',
  'H II region',
  'Protoplanetary disk',
  'Interstellar object',
  'Sagittarius A',
])

/**
 * Reject before spending a fetch. Category:Stars is mostly catalogue entries
 * like "19 Ursae Minoris" and "51 Pegasi" — real articles, useless as cards.
 */
function titleLooksUsable(title) {
  if (REJECT.has(title)) return false
  if (/\d/.test(title)) return false
  if (/\(.*\)/.test(title)) return false
  if (/^List of/i.test(title)) return false
  // binomial star designations: "Alpha Centauri", "Beta Pictoris"
  if (/^(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega)\s/i.test(title)) {
    return false
  }
  if (!title.includes(' ') && !CORE_CONCEPTS.has(title)) return false
  // variable-star designations: "AG Carinae", "BP Crucis", "KY Cygni", "Q Type Star"
  if (/^[A-Z]{1,3}\s/.test(title)) return false
  // stars named after whoever spotted them: "Kapteyn's Star", "Scholz's Star"
  if (/'s Star$/.test(title)) return false
  return title.length <= 34
}

function tidy(raw) {
  return raw
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/["“”]/g, '')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isKidReadable(sentence, allow = []) {
  const lower = sentence.toLowerCase()
  if (filters.jargon.some((w) => lower.includes(w))) return false
  if (NOT_FOR_KIDS.test(sentence)) return false
  if (/[();:×^~≈…]/.test(sentence)) return false
  if (/\d{5,}/.test(sentence)) return false
  const words = sentence.split(/\s+/)
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) return false
  const spared = new Set(allow.flatMap((p) => p.toLowerCase().split(/\s+/)))
  const tooLong = words.some((w) => {
    const bare = w.replace(/[^A-Za-z-]/g, '')
    return bare.length > MAX_WORD_LENGTH && !spared.has(bare.toLowerCase())
  })
  if (tooLong) return false
  return /[.!?]$/.test(sentence)
}

/**
 * Sentences that pass every readability check and still say nothing a child can
 * hold on to. Each of these came out of the first crawl:
 *   - fifteen nebula pages whose whole card was a distance in light-years
 *   - astronaut pages that are interchangeable biography openers
 *   - two Meitei mythology figures, from Category:Sun
 *   - telescope pages that are optical engineering
 */
const EMPTY_SENTENCE = [
  /^it is about [\d,.]+ (?:million |billion )?light[- ]years? away/i,
  /^it is about [\d,.]+ (?:km|kilometres|kilometers|miles) /i,
  /\b(?:is|was) an? [A-Z]?[a-z]+(?: [A-Z][a-z]+)? (?:astronaut|cosmonaut|engineer|pilot|politician|chemist|physicist|doctor)\b/,
  /^(?:he|she) (?:is|was) /i,
  /\bMeitei\b|\bliterary work\b/,
  /^[A-Z][\w' -]+ (?:is|are) an? (?:type|kind|group|region|layer|zone|design) of\b/i,
  /\b(?:reflector|Newtonian|Cassegrain|Dobsonian|Gregorian|Herschelian|Schmidt) telescope\b/i,
  /^in the New General Catalogue/i,
]

function saysSomething(sentence) {
  return !EMPTY_SENTENCE.some((p) => p.test(sentence))
}

function artFor(section, text) {
  for (const [pattern, art] of ART_KEYWORDS) if (pattern.test(text)) return art
  return DEFAULT_ART[section]
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Wikipedia throttles unauthenticated crawlers hard; back off rather than die. */
async function get(url, tries = 4) {
  for (let i = 0; i < tries; i += 1) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) return res.json()
    if (res.status === 429) {
      const wait = PAUSE_MS * 2 ** (i + 2)
      console.log(`  429, waiting ${wait}ms`)
      await sleep(wait)
      continue
    }
    return null
  }
  return null
}

mkdirSync(CACHE_DIR, { recursive: true })
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
let fetched = 0

async function summaryOf(title) {
  if (title in cache) return cache[title]
  const data = await get(SUMMARY + encodeURIComponent(title.replace(/ /g, '_')))
  fetched += 1
  // `null` is cached too: a page that gave nothing should not be retried
  cache[title] = data && data.type === 'standard' ? (data.extract ?? null) : null
  if (fetched % 20 === 0) writeFileSync(CACHE, JSON.stringify(cache))
  await sleep(PAUSE_MS)
  return cache[title]
}

async function membersOf(category) {
  const url =
    `${API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(
      'Category:' + category,
    )}&cmlimit=500&cmtype=page&format=json&origin=*`
  const data = await get(url)
  await sleep(PAUSE_MS)
  return (data?.query?.categorymembers ?? []).map((m) => m.title)
}

const bySection = {}
let considered = 0
let gated = 0

for (const [section, categories] of Object.entries(SECTIONS)) {
  const titles = new Set()
  for (const category of categories) {
    const members = await membersOf(category)
    for (const t of members) {
      considered += 1
      if (titleLooksUsable(t)) titles.add(t)
      else gated += 1
    }
    console.log(`${section} / ${category}: ${members.length} members`)
  }

  const cards = []
  for (const title of titles) {
    const extract = await summaryOf(title)
    if (!extract) continue
    const lines = extract
      .split(/(?<=[.!?])\s+/)
      .map(tidy)
      .filter(Boolean)
      .filter((s) => isKidReadable(s, [title]))
      .filter(saysSomething)
      .slice(0, PER_PAGE)
    if (lines.length === 0) continue
    const gate = RELEVANCE[section]
    if (gate) {
      const text = `${title} ${lines.join(' ')}`
      if (!gate.want.test(text) || gate.avoid.test(text)) continue
    }
    cards.push({ art: artFor(section, `${title} ${lines.join(' ')}`), title, lines })
  }
  bySection[section] = cards
  console.log(`  -> ${section}: ${cards.length} cards from ${titles.size} pages`)
}

writeFileSync(CACHE, JSON.stringify(cache))

const render = (cards) =>
  cards
    .map(
      (c) =>
        `  { art: '${c.art}', title: ${JSON.stringify(
          c.title,
        )}, lines: [${c.lines.map((l) => JSON.stringify(l)).join(', ')}] },`,
    )
    .join('\n')

const entries = Object.entries(bySection)
  .map(([section, cards]) => `  '${section}': [\n${render(cards)}\n  ],`)
  .join('\n')

writeFileSync(
  OUT,
  `// Generated by scripts/gen-wiki-facts.mjs — do not edit by hand.
// Source: Simple English Wikipedia, filtered by src/content/kidFilters.json.
import type { LearnCard } from '../space'
import type { MissionId } from '../space'

export const WIKI_FACTS: Partial<Record<MissionId, LearnCard[]>> = {
${entries}
}
`,
)

const total = Object.values(bySection).reduce((n, c) => n + c.length, 0)
console.log(
  `\nwrote ${total} cards. ${gated} of ${considered} titles rejected before fetching.`,
)
