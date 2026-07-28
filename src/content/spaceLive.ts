/**
 * Live space data, turned into kid sentences.
 *
 * Rule: we read numbers and names from the APIs and write the sentence
 * ourselves. Nothing from an API is shown as prose — their captions read like
 * "a protuberance on the face housing the nostrils" (see wordMeanings.ts for
 * how that went). Everything here is optional: if a call fails, is slow, or the
 * kid is offline, the card is skipped and the curated cards still work.
 *
 * Sources (all keyless, all CORS-enabled — checked from the browser):
 *   people in space  https://corquaid.github.io/international-space-station-APIs/
 *   ISS position     https://api.wheretheiss.at/v1/satellites/25544
 *   next launch      https://ll.thespacedevs.com/2.3.0/launches/upcoming/
 */
import type { LearnCard, MissionId } from './space'
import { fetchTopicCards } from './factEngine'
import { dayKey, freshFacts, moonPhaseForDay } from './spaceFacts'
import { markSeen, pickFresh } from './seen'
import { topicsFor } from './spaceTopics'
import { MOON_FACTS, PLANET_FACTS, ROCK_FACTS } from './space/generatedFacts'
import { WIKI_FACTS } from './space/wikiFacts'

const CACHE_KEY = 'space-today-v1'
const TIMEOUT_MS = 4500

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

type PeopleInSpace = {
  number?: number
  people?: { name?: string; craft?: string }[]
}

async function peopleCard(): Promise<LearnCard | null> {
  const data = await getJson<PeopleInSpace>(
    'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
  )
  const count = data?.number
  if (typeof count !== 'number' || count <= 0) return null
  const crafts = [
    ...new Set((data?.people ?? []).map((p) => p.craft).filter(Boolean)),
  ] as string[]
  return {
    art: 'astronaut',
    title: `${count} people are in space right now`,
    lines: [
      count === 1
        ? 'One astronaut is up there today, going around and around the Earth.'
        : `That is ${count} astronauts living above us today, going around and around the Earth.`,
      crafts.length > 0 ? `They are aboard: ${crafts.join(', ')}.` : '',
    ].filter(Boolean),
  }
}

type IssPosition = { altitude?: number; velocity?: number }

async function issCard(): Promise<LearnCard | null> {
  const data = await getJson<IssPosition>(
    'https://api.wheretheiss.at/v1/satellites/25544',
  )
  if (typeof data?.altitude !== 'number' || typeof data?.velocity !== 'number') {
    return null
  }
  const km = Math.round(data.altitude)
  const speed = Math.round(data.velocity / 100) * 100
  return {
    art: 'rocket',
    title: 'The space station is flying right now',
    lines: [
      `It is ${km} km above the ground, going about ${speed.toLocaleString('en-GB')} km/h.`,
      'That is fast enough to go all the way around Earth every 90 minutes.',
    ],
  }
}

type Launches = { results?: { name?: string; net?: string }[] }

async function launchCard(now: Date): Promise<LearnCard | null> {
  const data = await getJson<Launches>(
    'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=1&mode=list&hide_recent_previous=true',
  )
  const next = data?.results?.[0]
  if (!next?.name) return null
  // "Falcon 9 Block 5 | Starlink Group 1-2" — the rocket is the part we want
  const rocket = next.name.split('|')[0].trim()
  const when = next.net ? new Date(next.net) : null
  const days =
    when && !Number.isNaN(when.getTime())
      ? Math.round((when.getTime() - now.getTime()) / 86_400_000)
      : null
  const soon =
    days === null
      ? 'It is on the launch pad soon.'
      : days <= 0
        ? 'It is going up today!'
        : days === 1
          ? 'It goes up tomorrow.'
          : `It goes up in about ${days} days.`
  return {
    art: 'rocket',
    title: `Next rocket up: ${rocket}`,
    lines: [soon, 'Somewhere on Earth a rocket launches almost every day.'],
  }
}

function localCards(now: Date): LearnCard[] {
  const moon = moonPhaseForDay(now)
  return [
    {
      art: 'moon-phases',
      title: `Tonight the Moon is a ${moon.name} ${moon.emoji}`,
      lines: [
        'Half the Moon is always sunlit — this is how much of the sunny half faces us today.',
      ],
    },
    ...freshFacts(3).map((fact) => ({
      art: fact.art,
      title: 'Did you know?',
      lines: [fact.text],
    })),
  ]
}

type Cached = { day: string; cards: LearnCard[] }

function readCache(day: string): LearnCard[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Cached
    return parsed.day === day && Array.isArray(parsed.cards)
      ? parsed.cards
      : null
  } catch {
    return null
  }
}

function writeCache(day: string, cards: LearnCard[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ day, cards }))
  } catch {
    // out of quota / private mode — we just refetch next time
  }
}

/**
 * Today's cards: computed ones first (always work), then whatever the live
 * sources answered. Cached for the calendar day so one visit per day fetches.
 */
export async function loadTodayCards(now = new Date()): Promise<LearnCard[]> {
  const day = dayKey(now)
  const cached = readCache(day)
  if (cached) return cached

  const live = await Promise.all([peopleCard(), issCard(), launchCard(now)])
  const cards = [...localCards(now), ...live.filter((c): c is LearnCard => !!c)]
  if (live.some(Boolean)) writeCache(day, cards)
  return cards
}

/** Cards we can show instantly while the live ones are still loading. */
export function todayCardsOffline(now = new Date()): LearnCard[] {
  return localCards(now)
}

/**
 * Facts generated from Solar System OpenData, phrased by us. No network, so
 * these show the instant a mission opens — the encyclopedia extras arrive after.
 *
 * The draw is deliberately far smaller than the pool: 113 facts are there to
 * make each visit different, not to make one visit long. A six-year-old clicking
 * Next twenty times has stopped learning somewhere around ten.
 */
const SOLAR: Partial<Record<MissionId, LearnCard[]>> = {
  planets: PLANET_FACTS,
  moon: MOON_FACTS,
  'space-rocks': ROCK_FACTS,
  'wow-facts': [...PLANET_FACTS, ...MOON_FACTS, ...ROCK_FACTS],
}

/**
 * Solar-system numbers plus the Wikipedia crawl. Sky Science, Deep Space and
 * Sun and Stars only have the crawl — no database explains why the sky is blue.
 */
const GENERATED: Partial<Record<MissionId, LearnCard[]>> = Object.fromEntries(
  (Object.keys({ ...SOLAR, ...WIKI_FACTS }) as MissionId[]).map((id) => [
    id,
    [...(SOLAR[id] ?? []), ...(WIKI_FACTS[id] ?? [])],
  ]),
)

// Amazing Space Facts is the everything mission
GENERATED['wow-facts'] = [
  ...(SOLAR['wow-facts'] ?? []),
  ...Object.values(WIKI_FACTS).flat(),
]

export function generatedFor(mission: MissionId, count = 6): LearnCard[] {
  const pool = GENERATED[mission] ?? []
  const picked = pickFresh(pool, count, (c) => `gen:${c.title}`)
  for (const card of picked) markSeen(`gen:${card.title}`)
  return picked
}

/**
 * Extra cards for any mission, written by the fact engine from topics the kid
 * has not been shown yet. Curated cards teach the core; these keep coming.
 */
export async function loadMissionExtras(
  mission: MissionId,
  count = 3,
): Promise<LearnCard[]> {
  // ask for a couple extra: some summaries lose every sentence to the filter
  const topics = pickFresh(
    topicsFor(mission),
    count + 2,
    (t) => `topic:${t.page}`,
  )
  if (topics.length === 0) return []
  const cards = (await fetchTopicCards(topics)).slice(0, count)
  for (const card of cards) markSeen(`card:${card.title}`)
  for (const topic of topics.slice(0, cards.length + 2)) {
    markSeen(`topic:${topic.page}`)
  }
  return cards
}
