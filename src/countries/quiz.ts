import {
  COUNTRIES,
  COUNTRY_ORDER,
  MAP_BOARD_REGIONS,
  ROUND_SIZE,
  type Country,
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

export type FlagQuestion = {
  kind: 'flags'
  countryId: CountryId
  choices: CountryId[]
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

export function pickRoundCountries(
  count: number = ROUND_SIZE,
  random: () => number = Math.random,
): CountryId[] {
  return shuffle(COUNTRY_ORDER, random).slice(0, Math.min(count, COUNTRY_ORDER.length))
}

function otherCountryIds(exclude: CountryId): CountryId[] {
  return COUNTRY_ORDER.filter((id) => id !== exclude)
}

/** Prefer similar flags, then fill from the rest. */
export function pickFlagDistractors(
  country: Country,
  count: number,
  random: () => number = Math.random,
): CountryId[] {
  const similar = country.similarFlagIds.filter((id) => id !== country.id)
  const rest = otherCountryIds(country.id).filter((id) => !similar.includes(id))
  const pool = [...shuffle(similar, random), ...shuffle(rest, random)]
  return pool.slice(0, count)
}

export function buildFlagQuestion(
  countryId: CountryId,
  difficulty: CountriesDifficulty,
  random: () => number = Math.random,
): FlagQuestion {
  const country = COUNTRIES[countryId]
  const choiceCount: 3 | 4 = difficulty === 'easy' ? 3 : 4
  const distractors = pickFlagDistractors(country, choiceCount - 1, random)
  const choices = shuffle([countryId, ...distractors], random)
  return { kind: 'flags', countryId, choices, choiceCount }
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

/** Flags and maps rotate separately: knowing a flag is not knowing the map. */
function seenKey(mode: CountriesMode, id: CountryId): string {
  return `country:${mode}:${id}`
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
  avoid: CountryId | null = null,
  random: () => number = Math.random,
): CountriesQuestion {
  const pool = COUNTRY_ORDER.filter((id) => id !== avoid)
  const key = (id: CountryId) => seenKey(mode, id)
  // anything never asked comes first, so a lap covers every country before
  // any of them comes round again
  const never = unseen(pool, key)
  const candidates =
    never.length > 0 ? never : pickFresh(pool, freshWindow(pool.length), key)
  const id = candidates[Math.floor(random() * candidates.length)]
  markSeen(seenKey(mode, id))
  if (mode === 'flags') return buildFlagQuestion(id, difficulty, random)
  if (difficulty === 'easy') return buildMapsEasyQuestion(id, random)
  return buildMapsMediumQuestion(id)
}

export function buildRound(
  mode: CountriesMode,
  difficulty: CountriesDifficulty,
  random: () => number = Math.random,
): CountriesQuestion[] {
  const ids = pickRoundCountries(ROUND_SIZE, random)
  return ids.map((id) => {
    if (mode === 'flags') return buildFlagQuestion(id, difficulty, random)
    if (difficulty === 'easy') return buildMapsEasyQuestion(id, random)
    return buildMapsMediumQuestion(id)
  })
}

export function isCorrectChoice(
  question: CountriesQuestion,
  answer: string,
): boolean {
  return answer === question.countryId
}
