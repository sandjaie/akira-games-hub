/**
 * The fact engine: takes an encyclopedia summary and turns it into a kid card
 * (art + title + one or two short lines), so nobody has to hand-write content
 * every day.
 *
 * Source is Simple English Wikipedia — the one encyclopedia already written at
 * a basic reading level ("A comet is a ball of mostly ice that moves around in
 * outer space"). Everything it hands us still goes through the readability
 * filter below, because plenty of its sentences carry grown-up baggage:
 * "On average, Saturn is about 9.57 astronomical units (1,432 Gm; 1.432×109 km)
 * away from the Sun."
 */
import type { LearnCard } from './space'
import type { SpaceArtKind } from './space/SpaceArt'

const WIKI = 'https://simple.wikipedia.org/api/rest_v1/page/summary/'
const TIMEOUT_MS = 4500

/** Words that mean the sentence is for grown-ups, not a six-year-old. */
const JARGON = [
  'astronomical unit',
  'hydrostatic',
  'eccentric',
  'ecliptic',
  'magnitude',
  'dark matter',
  'subtype',
  'infrared',
  'ultraviolet',
  'radio wave',
  'spectrum',
  'droplet',
  'minor planet',
  'natural satellite',
  'perihelion',
  'aphelion',
  'nuclear fusion',
  'plasma',
  'photosphere',
  'terrestrial',
  'refract',
  'diffract',
  'wavelength',
  'axial tilt',
  'retrograde',
  'differentiat',
  'composition',
  'approximately',
  'respectively',
  'designation',
  'classificat',
  'observator',
  'hypothes',
  'kilogram',
  'density',
  'mass of',
]

const MAX_WORDS = 20
const MIN_WORDS = 5
const MAX_WORD_LENGTH = 12

/** Trim the encyclopedia habits: brackets, asides, quotes, stray spaces. */
export function tidySentence(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/,\s*(also|often|sometimes) (known|called) as [^,.]+,/gi, ' ')
    .replace(/["“”']/g, '')
    .replace(/\s+([,.])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function splitSentences(extract: string): string[] {
  return extract
    .split(/(?<=[.!?])\s+/)
    .map(tidySentence)
    .filter(Boolean)
}

/**
 * `allow` exempts words from the length cap — a country's own name is a word a
 * kid is being taught, so "Liechtenstein is a country in Europe." must survive
 * a filter that otherwise rejects anything over twelve letters.
 */
export function isKidReadable(sentence: string, allow: string[] = []): boolean {
  const lower = sentence.toLowerCase()
  if (JARGON.some((word) => lower.includes(word))) return false
  if (/[();:×^~≈…]/.test(sentence)) return false
  if (/\d{5,}/.test(sentence)) return false
  if (/\d+(\.\d+)?\s*(gm|au|km\/s|mi|ly)\b/i.test(sentence)) return false
  const words = sentence.split(/\s+/)
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) return false
  const spared = new Set(
    allow.flatMap((phrase) => phrase.toLowerCase().split(/\s+/)),
  )
  const tooLong = words.some((w) => {
    const bare = w.replace(/[^A-Za-z-]/g, '')
    return bare.length > MAX_WORD_LENGTH && !spared.has(bare.toLowerCase())
  })
  if (tooLong) return false
  return /[.!?]$/.test(sentence)
}

const ART_KEYWORDS: [RegExp, SpaceArtKind][] = [
  [/mercury/i, 'mercury'],
  [/venus/i, 'venus'],
  [/\bmars|olympus|phobos|deimos/i, 'mars'],
  [/jupiter|great red spot|io\b|europa|ganymede|callisto/i, 'jupiter'],
  [/saturn|titan|enceladus|ring/i, 'saturn'],
  [/uranus/i, 'uranus'],
  [/neptune|triton/i, 'neptune'],
  [/pluto|dwarf planet|ceres|eris/i, 'pluto'],
  [/\bmoon\b|lunar|crater/i, 'moon'],
  [/phase|crescent|gibbous/i, 'moon-phases'],
  [/\bsun\b|solar flare|sunspot/i, 'sun'],
  [/solar system|orbit of the planets/i, 'solar-system'],
  [/comet|halley/i, 'comet'],
  [/asteroid|belt/i, 'asteroid-belt'],
  [/meteorite/i, 'meteorite'],
  [/meteor|shooting star/i, 'meteor'],
  [/milky way/i, 'milky-way'],
  [/galaxy|andromeda|nebula/i, 'galaxy'],
  [/light-year|light year|speed of light/i, 'light-year'],
  [/rainbow/i, 'raindrops'],
  [/sunset|sunrise|dusk/i, 'sunset'],
  [/\bsky\b|blue light|atmosphere/i, 'blue-sky'],
  [/colour|color|prism/i, 'rainbow-light'],
  [/astronaut|space station|spacesuit|apollo/i, 'astronaut'],
  [/rocket|launch|spacecraft|probe/i, 'rocket'],
  [/volcano|mountain/i, 'volcano'],
  [/telescope|hubble|webb/i, 'telescope'],
  [/\bearth\b/i, 'earth'],
  [/\bstar|constellation/i, 'stars'],
]

export function artForText(text: string, hint?: SpaceArtKind): SpaceArtKind {
  if (hint) return hint
  for (const [pattern, art] of ART_KEYWORDS) {
    if (pattern.test(text)) return art
  }
  return 'stars'
}

export type Topic = { title: string; page: string; art?: SpaceArtKind }

/**
 * Only landscape-ish photos: the card slot is a square, and Wikipedia leads
 * plenty of pages with a tall portrait or a logo that crops to nonsense.
 */
function usablePhoto(thumb?: WikiThumb): string | undefined {
  if (!thumb?.source || !thumb.width || !thumb.height) return undefined
  const ratio = thumb.width / thumb.height
  return ratio >= 0.8 && ratio <= 2.2 ? thumb.source : undefined
}

/** Build a card from a summary: at most two readable sentences. */
export function toKidCard(
  topic: Topic,
  extract: string,
  thumb?: WikiThumb,
): LearnCard | null {
  const usable = splitSentences(extract)
    .filter((line) => isKidReadable(line))
    .slice(0, 2)
  if (usable.length === 0) return null
  return {
    art: artForText(`${topic.page} ${usable.join(' ')}`, topic.art),
    title: topic.title,
    lines: usable,
    photo: usablePhoto(thumb),
  }
}

export type WikiThumb = { source?: string; width?: number; height?: number }

type WikiSummary = { extract?: string; thumbnail?: WikiThumb }

export async function fetchTopicCard(topic: Topic): Promise<LearnCard | null> {
  try {
    const res = await fetch(`${WIKI}${encodeURIComponent(topic.page)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    const data = (await res.json()) as WikiSummary
    return data.extract ? toKidCard(topic, data.extract, data.thumbnail) : null
  } catch {
    return null
  }
}

/** Fetch several topics at once; drop the ones that fail the filter. */
export async function fetchTopicCards(topics: Topic[]): Promise<LearnCard[]> {
  const cards = await Promise.all(topics.map(fetchTopicCard))
  return cards.filter((c): c is LearnCard => c !== null)
}
