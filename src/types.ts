import type {
  CountriesDifficulty,
  CountriesMode,
  CountriesModeKey,
} from './countries/quiz'
import type { JumbledDifficulty } from './content/jumbledWords'
import type { WordLevelId } from './content/wordLevels'

export type LabStationId =
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'power'
  | 'speakers'
  | 'wifi'

export type StationId = LabStationId | 'laptop'

export type Screen =
  | { name: 'welcome' }
  | { name: 'map' }
  | { name: 'station'; stationId: LabStationId }
  | { name: 'laptop' }
  | { name: 'celebration' }
  | { name: 'words-map' }
  | { name: 'words-play'; levelId: WordLevelId }
  | { name: 'words-clear'; levelId: WordLevelId }
  | { name: 'jumbled-difficulty' }
  | { name: 'jumbled-play'; difficulty: JumbledDifficulty }
  | { name: 'jumbled-results'; difficulty: JumbledDifficulty; stars: 1 | 2 | 3 }
  | { name: 'countries-mode' }
  | { name: 'countries-difficulty'; mode: CountriesMode }
  | {
      name: 'countries-play'
      mode: CountriesMode
      difficulty: CountriesDifficulty
    }
  | {
      name: 'countries-results'
      mode: CountriesMode
      difficulty: CountriesDifficulty
      score: number
      asked: number
      stars: 0 | 1 | 2 | 3
    }

export type LabProgress = { completed: StationId[] }

export type WordsProgress = {
  unlockedLevelIds: WordLevelId[]
  completedLevelIds: WordLevelId[]
  wordsTypedCount: number
}

export type JumbledProgress = {
  completedDifficulties: JumbledDifficulty[]
  bestStars: Partial<Record<JumbledDifficulty, 1 | 2 | 3>>
}

export type CountriesProgress = {
  completedModes: CountriesModeKey[]
  bestStars: Partial<Record<CountriesModeKey, 1 | 2 | 3>>
}

export type AppProgress = {
  lab: LabProgress
  words: WordsProgress
  jumbled: JumbledProgress
  countries: CountriesProgress
}

export type GameKind =
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'power'
  | 'speakers'
  | 'wifi'

export type StationDefinition = {
  id: LabStationId
  kidName: string
  grownUpWord?: string
  blurb: [string, string]
  game: GameKind
  mapLabel: string
}
