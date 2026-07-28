/**
 * Generates src/content/space/generatedFacts.ts from Solar System OpenData.
 *
 *   SSO_KEY=<your-key> node scripts/gen-space-facts.mjs
 *
 * The key is read from the environment and never committed — it is only needed
 * here, on a developer machine. Do not move this to runtime: a bearer token in
 * a Vite bundle is readable by anyone who opens devtools, and the data does not
 * change often enough to be worth the exposure.
 *
 * The rule this follows is the one spaceLive.ts already sets: read numbers and
 * names from the API, write the sentence ourselves. Every fact below is phrased
 * here, so it is guaranteed to read at the right level however raw the source.
 *
 * Fields go missing in the source (Mercury has no average temperature, Haumea
 * no radius), so every template checks before it speaks.
 */
import { writeFileSync } from 'node:fs'

const API = 'https://api.le-systeme-solaire.net/rest/bodies/'
const OUT = new URL('../src/content/space/generatedFacts.ts', import.meta.url)
const KEY = process.env.SSO_KEY
if (!KEY) throw new Error('set SSO_KEY (https://api.le-systeme-solaire.net/generatekey.html)')

const EARTH_RADIUS = 6371
const EARTH_GRAVITY = 9.81
const DAYS_PER_YEAR = 365.25
const OUR_MOON_RADIUS = 1737
/** Beyond this a count stops being a picture in the head and becomes noise. */
const GRASPABLE = 50
/** Moons only count if a child has heard of what they go round. */
const KNOWN_HOSTS = new Set([
  'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'pluton', 'terre',
])

/** Four astronomers is a mouthful to read aloud; one and a nod is not. */
function creditFor(discoveredBy) {
  const names = discoveredBy.split(',').map((n) => n.trim()).filter(Boolean)
  if (names.length === 0) return null
  return names.length > 1 ? `${names[0]} and their team` : names[0]
}

/**
 * Reduce a catalogue entry to the name people actually use.
 *   "136199 Eris"          -> Eris
 *   "(162173) Ryugu"       -> Ryugu
 *   "C/2020 F3 (NEOWISE)"  -> NEOWISE
 * A designation in brackets after a numbered prefix is the real name.
 */
function cleanName(name) {
  const trailing = name.match(/^(.*\d.*)\s+\(([^)]+)\)$/)
  if (trailing) return trailing[2].trim()
  return name.replace(/^\d+\s+/, '').replace(/^\([^)]*\)\s*/, '').trim()
}

/**
 * A moon worth a card has a name, not a designation. Filtering on size was the
 * wrong proxy: it threw away named moons like Phobos and let nothing useful in.
 * `S/2003 J 12` and `(308933) 2006 SQ372` are catalogue entries — a child is not
 * being taught those.
 */
function isNamed(body) {
  const n = cleanName(body.englishName || '')
  // whatever survives cleaning must read as a name, not a catalogue number
  return Boolean(n) && !/\d/.test(n) && !n.includes('S/')
}

function round(n, places = 0) {
  const f = 10 ** places
  return Math.round(n * f) / f
}

/** Kelvin is not a unit a six-year-old has met. */
function celsius(kelvin) {
  return Math.round(kelvin - 273.15)
}

function orbitPhrase(days) {
  if (days >= 2 * DAYS_PER_YEAR) {
    const years = round(days / DAYS_PER_YEAR, days < 20 * DAYS_PER_YEAR ? 1 : 0)
    return `${years} Earth years`
  }
  return `${round(days)} Earth days`
}

function dayPhrase(hours) {
  const h = Math.abs(hours)
  if (h >= 48) return `${round(h / 24)} Earth days`
  return `${round(h, h < 10 ? 1 : 0)} hours`
}

/** Every fact is one template. Each returns null when the data is not there. */
function planetFacts(body, art) {
  const name = cleanName(body.englishName)
  const out = []
  const add = (kind, title, line) => out.push({ kind, art, title, lines: [line] })

  const moons = (body.moons || []).length
  if (moons === 0) {
    add('moons', `${name} has no moons`, `Not a single moon goes around ${name}.`)
  } else if (moons === 1) {
    add('moons', `${name} has one moon`, `Just one moon goes around ${name}.`)
  } else {
    add(
      'moons',
      `${name} has ${moons} moons`,
      `That is ${moons} moons all going around ${name} at once.`,
    )
  }

  if (body.sideralOrbit > 0) {
    add(
      'year',
      `A year on ${name}`,
      `${name} takes ${orbitPhrase(body.sideralOrbit)} to go once around the Sun.`,
    )
  }

  if (body.sideralRotation) {
    add(
      'day',
      `A day on ${name}`,
      `${name} spins around once every ${dayPhrase(body.sideralRotation)}.`,
    )
    if (body.sideralRotation < 0) {
      add(
        'spin',
        `${name} spins backwards`,
        `${name} turns the opposite way to Earth, so the Sun would come up in the west.`,
      )
    }
  }

  if (body.meanRadius > 0) {
    const times = body.meanRadius / EARTH_RADIUS
    if (times >= 1.5) {
      add(
        'size',
        `${name} is bigger than Earth`,
        `You could line up about ${round(times)} Earths across ${name}.`,
      )
    } else if (times <= 0.7) {
      add(
        'size',
        `${name} is smaller than Earth`,
        `About ${round(1 / times)} of them side by side would stretch across Earth.`,
      )
    }
  }

  if (body.gravity > 0) {
    const pull = body.gravity / EARTH_GRAVITY
    if (pull >= 1.3) {
      add(
        'gravity',
        `You would feel heavy on ${name}`,
        `${name} pulls about ${round(pull, 1)} times harder than Earth does.`,
      )
    } else if (pull <= 0.7) {
      add(
        'gravity',
        `You could jump high on ${name}`,
        `${name} pulls only about ${round(pull, 1)} times as hard as Earth, so you would float up.`,
      )
    }
  }

  // 0 K means the source has no reading, not a temperature.
  // The comparison varies with how extreme it is, or nine planets in a row all
  // get the same sentence about a freezer.
  if (body.avgTemp > 0) {
    const c = celsius(body.avgTemp)
    const tail =
      c >= 100
        ? 'That is hotter than any oven at home.'
        : c >= 0
          ? 'That is a temperature you could stand outside in.'
          : c >= -150
            ? 'A freezer at home is only about -18.'
            : 'Nothing we know of could keep warm out there.'
    add('temp', c >= 0 ? `How warm is ${name}?` : `How cold is ${name}?`, `It is about ${c} degrees on ${name}. ${tail}`)
  }

  return out
}

function moonFacts(body, planetName, art) {
  const name = cleanName(body.englishName)
  const out = [
    {
      kind: 'orbits',
      art,
      title: `${name} is a moon of ${planetName}`,
      lines: [`${name} goes around ${planetName}, not around the Sun.`],
    },
  ]

  const year = (body.discoveryDate || '').slice(-4)
  const credit = body.discoveredBy ? creditFor(body.discoveredBy) : null
  if (credit && /^\d{4}$/.test(year)) {
    out.push({
      kind: 'discovery',
      art,
      title: `Who found ${name}`,
      lines: [`${credit} spotted ${name} back in ${year}.`],
    })
  }

  // our own Moon is the only one a child has seen, so it is the ruler
  if (body.meanRadius > 0 && name !== 'Moon') {
    const times = body.meanRadius / OUR_MOON_RADIUS
    if (times >= 1.15) {
      out.push({
        kind: 'moon-size',
        art,
        title: `${name} is bigger than our Moon`,
        lines: [`${name} is about ${round(times, 1)} times as wide as the Moon we see.`],
      })
    } else if (times <= 0.6) {
      // Give the real width, not just the ratio. Every small moon is a
      // different size, so every sentence comes out different — a fixed phrase
      // for "very small" repeated across a hundred moons.
      const km = round(body.meanRadius * 2)
      const across = round(1 / times)
      out.push({
        kind: 'moon-size',
        art,
        title: `How big is ${name}?`,
        lines: [
          across <= GRASPABLE
            ? `${name} is about ${km} km across. You could line up ${across} of them over our Moon.`
            : `${name} is only about ${km} km across — our Moon is around ${across} times wider.`,
        ],
      })
    }
  }

  if (body.sideralOrbit > 0) {
    const days = body.sideralOrbit
    const phrase =
      days < 1
        ? `${round(days * 24)} hours`
        : days > 400
          ? `${round(days / DAYS_PER_YEAR, 1)} Earth years`
          : `${round(days, days < 10 ? 1 : 0)} Earth days`
    out.push({
      kind: 'moon-orbit',
      art,
      title: `${name} goes round ${planetName}`,
      lines: [`One full lap around ${planetName} takes ${name} ${phrase}.`],
    })
  }

  return out
}

/** Named asteroids and comets — the rocks with stories, not the numbered ones. */
function rockFacts(body) {
  const name = cleanName(body.englishName)
  const isComet = body.bodyType === 'Comet'
  const art = isComet ? 'comet' : 'asteroid-belt'
  const what = isComet ? 'a comet' : 'an asteroid'
  const out = [
    {
      kind: 'rock',
      art,
      title: `${name} is ${what}`,
      lines: [
        isComet
          ? `${name} is a ball of ice and dust that loops around the Sun.`
          : `${name} is a lump of rock going around the Sun.`,
      ],
    },
  ]
  const year = (body.discoveryDate || '').slice(-4)
  const credit = body.discoveredBy ? creditFor(body.discoveredBy) : null
  if (credit && /^\d{4}$/.test(year)) {
    out.push({
      kind: 'rock-discovery',
      art,
      title: `Who spotted ${name}`,
      lines: [`${credit} found it in ${year}.`],
    })
  }
  if (body.sideralOrbit > DAYS_PER_YEAR) {
    out.push({
      kind: 'rock-orbit',
      art,
      title: `${name} takes its time`,
      lines: [
        `${name} needs about ${round(body.sideralOrbit / DAYS_PER_YEAR)} Earth years to go once around the Sun.`,
      ],
    })
  }
  return out
}

/**
 * Facts about two bodies at once. This is where the numbers get interesting —
 * "Neptune is colder than Mars" means nothing on its own, but "you would weigh
 * six times more on Jupiter than on Mars" is a thing a child repeats at dinner.
 * Only emitted when the difference is big enough to be worth saying.
 */
function comparisonFacts(a, b, artOf) {
  const [an, bn] = [cleanName(a.englishName), cleanName(b.englishName)]
  const art = artOf(a)
  const out = []
  const add = (kind, title, line) => out.push({ kind, art, title, lines: [line] })

  if (a.gravity > 0 && b.gravity > 0) {
    const times = a.gravity / b.gravity
    if (times >= 1.8) {
      add(
        'vs-gravity',
        `Heavier on ${an} than ${bn}`,
        `You would weigh about ${round(times, 1)} times more standing on ${an} than on ${bn}.`,
      )
    }
  }

  if (a.meanRadius > 0 && b.meanRadius > 0) {
    const times = a.meanRadius / b.meanRadius
    if (times >= 1.8) {
      add(
        'vs-size',
        `${an} next to ${bn}`,
        `${an} is about ${round(times, times < 10 ? 1 : 0)} times as wide as ${bn}.`,
      )
    }
  }

  if (a.sideralOrbit > 0 && b.sideralOrbit > 0) {
    const times = a.sideralOrbit / b.sideralOrbit
    if (times >= 2) {
      add(
        'vs-year',
        `A year on ${an} against ${bn}`,
        `${an} takes about ${round(times)} times longer than ${bn} to go once around the Sun.`,
      )
    }
  }

  const am = (a.moons || []).length
  const bm = (b.moons || []).length
  if (am - bm >= 5) {
    add(
      'vs-moons',
      `${an} has more moons than ${bn}`,
      bm === 0
        ? `${an} has ${am} moons. ${bn} has none at all.`
        : `${an} has ${am} moons to ${bn}'s ${bm}.`,
    )
  }

  if (a.avgTemp > 0 && b.avgTemp > 0) {
    const diff = Math.round(a.avgTemp - b.avgTemp)
    if (diff >= 60) {
      add(
        'vs-temp',
        `${an} is warmer than ${bn}`,
        `It is about ${diff} degrees warmer on ${an} than it is on ${bn}.`,
      )
    }
  }

  return out
}

/** The records: biggest, coldest, most moons. Computed, never hand-listed. */
function superlativeFacts(list, artOf) {
  const out = []
  const best = (field, pick, kind, title, line) => {
    const usable = list.filter((b) => (b[field] ?? 0) > 0 || field === 'moons')
    if (usable.length === 0) return
    const winner = usable.reduce(pick)
    out.push({
      kind,
      art: artOf(winner),
      title: title(cleanName(winner.englishName)),
      lines: [line(cleanName(winner.englishName), winner)],
    })
  }

  best('moons', (x, y) => ((x.moons || []).length > (y.moons || []).length ? x : y), 'record',
    (n) => `${n} has the most moons`,
    (n, b) => `Nothing else in the Solar System has as many as ${n}'s ${(b.moons || []).length}.`)

  best('meanRadius', (x, y) => (x.meanRadius > y.meanRadius ? x : y), 'record',
    (n) => `${n} is the biggest planet`,
    (n) => `Every other planet would fit inside ${n} with room to spare.`)

  best('sideralOrbit', (x, y) => (x.sideralOrbit > y.sideralOrbit ? x : y), 'record',
    (n) => `${n} has the longest year`,
    (n, b) => `One trip around the Sun takes ${n} about ${round(b.sideralOrbit / DAYS_PER_YEAR)} Earth years.`)

  best('sideralOrbit', (x, y) => (x.sideralOrbit < y.sideralOrbit ? x : y), 'record',
    (n) => `${n} has the shortest year`,
    (n, b) => `${n} races around the Sun in only ${round(b.sideralOrbit)} Earth days.`)

  best('avgTemp', (x, y) => (x.avgTemp > y.avgTemp ? x : y), 'record',
    (n) => `${n} is the hottest`,
    (n, b) => `It reaches about ${celsius(b.avgTemp)} degrees there — hotter than any oven.`)

  best('avgTemp', (x, y) => (x.avgTemp < y.avgTemp ? x : y), 'record',
    (n) => `${n} is the coldest`,
    (n, b) => `It sits at about ${celsius(b.avgTemp)} degrees, all the time.`)

  best('gravity', (x, y) => (x.gravity > y.gravity ? x : y), 'record',
    (n) => `${n} pulls the hardest`,
    (n) => `${n} has the strongest pull of any planet, so you would feel very heavy.`)

  return out
}

const res = await fetch(API, { headers: { Authorization: `Bearer ${KEY}` } })
if (!res.ok) throw new Error(`bodies fetch failed: ${res.status}`)
const { bodies } = await res.json()

const byId = new Map(bodies.map((b) => [b.id, b]))
const PLANET_ART = {
  mercure: 'mercury',
  venus: 'venus',
  terre: 'earth',
  mars: 'mars',
  jupiter: 'jupiter',
  saturne: 'saturn',
  uranus: 'uranus',
  neptune: 'neptune',
  pluton: 'pluto',
}

const artOf = (body) => PLANET_ART[body.id] ?? 'solar-system'

const worlds = bodies.filter(
  (b) => b.bodyType === 'Planet' || b.bodyType === 'Dwarf Planet',
)
const realPlanets = worlds.filter((b) => b.bodyType === 'Planet')

const planets = []
const moons = []
const rocks = []

for (const body of worlds) planets.push(...planetFacts(body, artOf(body)))

// every ordered pair, so both "A is bigger than B" directions get a chance to
// pass their threshold — the templates themselves decide which is worth saying
for (const a of worlds) {
  for (const b of worlds) {
    if (a.id !== b.id) planets.push(...comparisonFacts(a, b, artOf))
  }
}
planets.push(...superlativeFacts(realPlanets, artOf))

for (const body of bodies) {
  if (body.bodyType === 'Moon' && isNamed(body)) {
    const host = byId.get(body.aroundPlanet?.planet)
    if (!host || !KNOWN_HOSTS.has(host.id)) continue
    moons.push(
      ...moonFacts(body, cleanName(host.englishName), PLANET_ART[host.id] ?? 'moon'),
    )
  }
  if (
    (body.bodyType === 'Asteroid' || body.bodyType === 'Comet') &&
    isNamed(body)
  ) {
    rocks.push(...rockFacts(body))
  }
}

/**
 * Round-robin the templates. Sorted alphabetically, every "A day on ..." card
 * sits next to the others, and the rotation hands a kid three of the same
 * sentence in a row. Interleaving means consecutive cards always differ.
 */
function interleave(rows) {
  const groups = new Map()
  for (const row of rows.sort((a, b) => a.title.localeCompare(b.title))) {
    const list = groups.get(row.kind) ?? []
    list.push(row)
    groups.set(row.kind, list)
  }
  // Offset each list before round-robining. Without this, index 0 of every
  // template is whatever sorts first alphabetically — so a kid got Earth's day,
  // Earth's year and Earth's moon count as three cards running.
  const lists = [...groups.values()].map((list, k) => {
    const at = (k * 7) % Math.max(1, list.length)
    return [...list.slice(at), ...list.slice(0, at)]
  })
  const out = []
  for (let i = 0; out.length < rows.length; i += 1) {
    for (const list of lists) if (list[i]) out.push(list[i])
  }
  return out
}

const render = (rows) =>
  interleave(rows)
    .map(
      (f) =>
        `  { art: '${f.art}', title: ${JSON.stringify(
          f.title,
        )}, lines: [${JSON.stringify(f.lines[0])}] },`,
    )
    .join('\n')

writeFileSync(
  OUT,
  `// Generated by scripts/gen-space-facts.mjs — do not edit by hand.
// Source: Solar System OpenData. Wording is ours, numbers are theirs.
import type { LearnCard } from '../space'

export const PLANET_FACTS: LearnCard[] = [
${render(planets)}
]

export const MOON_FACTS: LearnCard[] = [
${render(moons)}
]

export const ROCK_FACTS: LearnCard[] = [
${render(rocks)}
]
`,
)

console.log(
  `wrote ${planets.length} planet + ${moons.length} moon + ${rocks.length} rock facts ` +
    `(${planets.length + moons.length + rocks.length} total) to ${OUT.pathname}`,
)
