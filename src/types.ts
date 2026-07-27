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

export type LabProgress = { completed: StationId[] }

export type WordsProgress = {
  unlockedLevelIds: WordLevelId[]
  completedLevelIds: WordLevelId[]
  wordsTypedCount: number
}

export type AppProgress = {
  lab: LabProgress
  words: WordsProgress
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
