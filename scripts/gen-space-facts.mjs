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
/** Below this a moon is a numbered rock, not something worth a card. */
const MOON_RADIUS_MIN = 200

/** "136199 Eris" is a catalogue entry; a child is being told about Eris. */
function cleanName(name) {
  return name.replace(/^\d+\s+/, '').trim()
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
  if (body.discoveredBy && /^\d{4}$/.test(year)) {
    out.push({
      kind: 'discovery',
      art,
      title: `Who found ${name}`,
      lines: [`${body.discoveredBy} spotted ${name} back in ${year}.`],
    })
  }
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

const planets = []
const moons = []
for (const body of bodies) {
  if (body.bodyType === 'Planet' || body.bodyType === 'Dwarf Planet') {
    planets.push(...planetFacts(body, PLANET_ART[body.id] ?? 'solar-system'))
  }
  if (body.bodyType === 'Moon' && (body.meanRadius || 0) >= MOON_RADIUS_MIN) {
    const host = byId.get(body.aroundPlanet?.planet)
    if (!host) continue
    moons.push(
      ...moonFacts(body, cleanName(host.englishName), PLANET_ART[host.id] ?? 'moon'),
    )
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
  const lists = [...groups.values()]
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
`,
)

console.log(
  `wrote ${planets.length} planet + ${moons.length} moon facts to ${OUT.pathname}`,
)
