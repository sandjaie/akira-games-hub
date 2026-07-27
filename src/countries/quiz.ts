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

/** 5→3, 3–4→2, 1–2→1, 0→0 */
export function starsFromScore(correct: number, total = ROUND_SIZE): RoundStars {
  const score = Math.max(0, Math.min(total, correct))
  if (score <= 0) return 0
  if (score <= 2) return 1
  if (score <= 4) return 2
  return 3
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
  ].slice(0, 2)
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
