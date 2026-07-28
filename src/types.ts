import type {
  CountriesDifficulty,
  CountriesMode,
  CountriesModeKey,
} from './countries/quiz'
import type { JumbledDifficulty } from './content/jumbledWords'
import type { MissionId } from './content/space'
import type { PaalId } from './content/thirukkural'
import type { WordLevelId } from './content/wordLevels'
import type { SpaceStars } from './space/quiz'

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
  | { name: 'space-mode' }
  | { name: 'space-missions'; mode: 'learn' | 'quiz' }
  | { name: 'space-learn'; missionId: MissionId }
  | { name: 'space-play'; missionId: MissionId }
  | {
      name: 'space-results'
      missionId: MissionId
      score: number
      asked: number
      stars: SpaceStars
    }
  | { name: 'tamizh-home' }
  | { name: 'thirukkural-paals' }
  | { name: 'thirukkural-chapters'; paalId: PaalId }
  | { name: 'thirukkural-read'; chapterId: number; index?: number }

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

export type SpaceProgress = {
  learnedMissionIds: MissionId[]
  bestStars: Partial<Record<MissionId, 1 | 2 | 3>>
}

export type TamizhProgress = {
  readChapterIds: number[]
}

export type AppProgress = {
  lab: LabProgress
  words: WordsProgress
  jumbled: JumbledProgress
  countries: CountriesProgress
  space: SpaceProgress
  tamizh: TamizhProgress
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
