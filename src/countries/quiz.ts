import {
  COUNTRIES,
  COUNTRY_ORDER,
  CURATED_CODES,
  continentOfCode,
  flagPool,
  MAP_BOARD_REGIONS,
  ROUND_SIZE,
  type CountryId,
  type MapBoardId,
  type MapRegionId,
} from '../content/countries'
import { markSeen, pickFresh, unseen } from '../content/seen'

export type CountriesMode = 'flags' | 'maps'
export type CountriesDifficulty = 'easy' | 'medium'

export type CountriesModeKey =
  | 'flags-easy'
  | 'flags-medium'
  | 'maps-easy'
  | 'maps-medium'

export type RoundStars = 0 | 1 | 2 | 3

/** Flags run on ISO codes: the pool is every UN member, not the curated set. */
export type FlagQuestion = {
  kind: 'flags'
  countryId: string
  choices: string[]
  choiceCount: 3 | 4
}

export type MapsEasyQuestion = {
  kind: 'maps-easy'
  countryId: CountryId
  board: MapBoardId
  highlight: CountryId
  choices: CountryId[]
}

export type MapsMediumQuestion = {
  kind: 'maps-medium'
  countryId: CountryId
  board: MapBoardId
  hotspots: MapRegionId[]
}

export type CountriesQuestion =
  | FlagQuestion
  | MapsEasyQuestion
  | MapsMediumQuestion

export function modeKey(
  mode: CountriesMode,
  difficulty: CountriesDifficulty,
): CountriesModeKey {
  return `${mode}-${difficulty}`
}

/** Share of answers right: 100%→3, 60%+→2, any→1, none→0. */
export function starsFromScore(correct: number, total = ROUND_SIZE): RoundStars {
  if (total <= 0) return 0
  const score = Math.max(0, Math.min(total, correct))
  const share = score / total
  if (share <= 0) return 0
  if (share >= 1) return 3
  if (share >= 0.6) return 2
  return 1
}

function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function otherCountryIds(exclude: CountryId): CountryId[] {
  return COUNTRY_ORDER.filter((id) => id !== exclude)
}

/** Flags the curated set calls out as look-alikes, as ISO codes. */
function similarCodes(code: string): string[] {
  const curated = Object.values(COUNTRIES).find(
    (c) => CURATED_CODES[c.id] === code,
  )
  return (curated?.similarFlagIds ?? []).map((id) => CURATED_CODES[id])
}

/**
 * Look-alike flags first, then the same continent, then anywhere. Same-continent
 * wrong answers are the ones worth thinking about; a random far-flung country
 * gives the answer away.
 */
export function pickFlagDistractors(
  code: string,
  pool: string[],
  count: number,
  random: () => number = Math.random,
): string[] {
  const others = pool.filter((c) => c !== code)
  const similar = similarCodes(code).filter((c) => others.includes(c))
  const continent = continentOfCode(code)
  const near = others.filter(
    (c) => !similar.includes(c) && continentOfCode(c) === continent,
  )
  const far = others.filter(
    (c) => !similar.includes(c) && !near.includes(c),
  )
  return [
    ...shuffle(similar, random),
    ...shuffle(near, random),
    ...shuffle(far, random),
  ].slice(0, count)
}

export function buildFlagQuestion(
  code: string,
  difficulty: CountriesDifficulty,
  random: () => number = Math.random,
): FlagQuestion {
  const choiceCount: 3 | 4 = difficulty === 'easy' ? 3 : 4
  const pool = flagPool(difficulty)
  const distractors = pickFlagDistractors(code, pool, choiceCount - 1, random)
  const choices = shuffle([code, ...distractors], random)
  return { kind: 'flags', countryId: code, choices, choiceCount }
}

export function buildMapsEasyQuestion(
  countryId: CountryId,
  random: () => number = Math.random,
): MapsEasyQuestion {
  const country = COUNTRIES[countryId]
  const board = country.mapBoard
  const sameBoard = MAP_BOARD_REGIONS[board].filter(
    (id): id is CountryId => id in COUNTRIES && id !== countryId,
  )
  const rest = otherCountryIds(countryId).filter((id) => !sameBoard.includes(id))
  const distractors = [
    ...shuffle(sameBoard, random),
    ...shuffle(rest, random),
  ].slice(0, 3)
  const choices = shuffle([countryId, ...distractors], random)
  return {
    kind: 'maps-easy',
    countryId,
    board,
    highlight: countryId,
    choices,
  }
}

export function buildMapsMediumQuestion(
  countryId: CountryId,
): MapsMediumQuestion {
  const country = COUNTRIES[countryId]
  const board = country.mapBoard
  const hotspots = MAP_BOARD_REGIONS[board]
  return {
    kind: 'maps-medium',
    countryId,
    board,
    hotspots,
  }
}

/**
 * Flags and maps rotate separately (knowing a flag is not knowing the map), and
 * so do the difficulties, or a lap of Easy would poison the much larger Medium
 * pool it is a subset of.
 */
function seenKey(
  mode: CountriesMode,
  difficulty: CountriesDifficulty,
  id: string,
): string {
  return `country:${mode}:${difficulty}:${id}`
}

/**
 * Once every country has been asked, choose between this many of the
 * longest-ago ones. Random inside a window keeps the order unpredictable; a
 * window of 1 would be a fixed carousel, the whole pool the old clumpy random.
 */
function freshWindow(poolSize: number): number {
  return Math.max(2, Math.ceil(poolSize / 3))
}

/** One question at a time — play runs until the kid stops. */
export function buildQuestion(
  mode: CountriesMode,
  difficulty: CountriesDifficulty,
  avoid: string | null = null,
  random: () => number = Math.random,
): CountriesQuestion {
  // maps stay on the curated twelve — every board and hotspot is hand-drawn
  const all = mode === 'flags' ? flagPool(difficulty) : COUNTRY_ORDER
  const pool = all.filter((id) => id !== avoid)
  const key = (id: string) => seenKey(mode, difficulty, id)
  // anything never asked comes first, so a lap covers every country before
  // any of them comes round again
  const never = unseen(pool, key)
  const candidates =
    never.length > 0 ? never : pickFresh(pool, freshWindow(pool.length), key)
  const id = candidates[Math.floor(random() * candidates.length)]
  markSeen(key(id))
  if (mode === 'flags') return buildFlagQuestion(id, difficulty, random)
  const countryId = id as CountryId
  if (difficulty === 'easy') return buildMapsEasyQuestion(countryId, random)
  return buildMapsMediumQuestion(countryId)
}

export function isCorrectChoice(
  question: CountriesQuestion,
  answer: string,
): boolean {
  return answer === question.countryId
}
