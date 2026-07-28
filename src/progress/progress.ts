import type {
  CountriesDifficulty,
  CountriesMode,
  CountriesModeKey,
  RoundStars,
} from '../countries/quiz'
import type { JumbledDifficulty } from '../content/jumbledWords'
import { LAB_ORDER } from '../content/stations'
import { WORD_LEVEL_ORDER, type WordLevelId } from '../content/wordLevels'
import { MISSION_ORDER, type MissionId } from '../content/space'
import type { SpaceStars } from '../space/quiz'
import type {
  AppProgress,
  CountriesProgress,
  SpaceProgress,
  JumbledProgress,
  LabProgress,
  LabStationId,
  StationId,
  WordsProgress,
} from '../types'

const KEY = 'cla-progress'

export { LAB_ORDER }

const COUNTRIES_MODE_KEYS: CountriesModeKey[] = [
  'flags-easy',
  'flags-medium',
  'maps-easy',
  'maps-medium',
]

export function emptyWordsProgress(): WordsProgress {
  return {
    unlockedLevelIds: [...WORD_LEVEL_ORDER],
    completedLevelIds: [],
    wordsTypedCount: 0,
  }
}

export function emptyJumbledProgress(): JumbledProgress {
  return {
    completedDifficulties: [],
    bestStars: {},
  }
}

export function emptyCountriesProgress(): CountriesProgress {
  return {
    completedModes: [],
    bestStars: {},
  }
}

export function emptySpaceProgress(): SpaceProgress {
  return {
    learnedMissionIds: [],
    bestStars: {},
  }
}

export function emptyProgress(): AppProgress {
  return {
    lab: { completed: [] },
    words: emptyWordsProgress(),
    jumbled: emptyJumbledProgress(),
    countries: emptyCountriesProgress(),
    space: emptySpaceProgress(),
  }
}

function normalizeWords(raw: Partial<WordsProgress> | undefined): WordsProgress {
  const unlocked = new Set<WordLevelId>(raw?.unlockedLevelIds ?? [])
  unlocked.add('animals')
  const completed = (raw?.completedLevelIds ?? []).filter((id): id is WordLevelId =>
    WORD_LEVEL_ORDER.includes(id as WordLevelId),
  )
  return {
    unlockedLevelIds: [...unlocked],
    completedLevelIds: completed,
    wordsTypedCount:
      typeof raw?.wordsTypedCount === 'number' ? raw.wordsTypedCount : 0,
  }
}

function normalizeJumbled(
  raw: Partial<JumbledProgress> | undefined,
): JumbledProgress {
  const completed = (raw?.completedDifficulties ?? []).filter(
    (d): d is JumbledDifficulty => d === 'easy' || d === 'medium',
  )
  const bestStars: JumbledProgress['bestStars'] = {}
  for (const d of ['easy', 'medium'] as JumbledDifficulty[]) {
    const stars = raw?.bestStars?.[d]
    if (stars === 1 || stars === 2 || stars === 3) bestStars[d] = stars
  }
  return { completedDifficulties: completed, bestStars }
}

function normalizeCountries(
  raw: Partial<CountriesProgress> | undefined,
): CountriesProgress {
  const completed = (raw?.completedModes ?? []).filter((k): k is CountriesModeKey =>
    COUNTRIES_MODE_KEYS.includes(k as CountriesModeKey),
  )
  const bestStars: CountriesProgress['bestStars'] = {}
  for (const key of COUNTRIES_MODE_KEYS) {
    const stars = raw?.bestStars?.[key]
    if (stars === 1 || stars === 2 || stars === 3) bestStars[key] = stars
  }
  return { completedModes: completed, bestStars }
}

function normalizeSpace(raw: Partial<SpaceProgress> | undefined): SpaceProgress {
  const learned = (raw?.learnedMissionIds ?? []).filter((id): id is MissionId =>
    MISSION_ORDER.includes(id as MissionId),
  )
  const bestStars: SpaceProgress['bestStars'] = {}
  for (const id of MISSION_ORDER) {
    const stars = raw?.bestStars?.[id]
    if (stars === 1 || stars === 2 || stars === 3) bestStars[id] = stars
  }
  return { learnedMissionIds: learned, bestStars }
}

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed && Array.isArray(parsed.completed) && !parsed.lab) {
      return {
        lab: { completed: parsed.completed as StationId[] },
        words: emptyWordsProgress(),
        jumbled: emptyJumbledProgress(),
        countries: emptyCountriesProgress(),
        space: emptySpaceProgress(),
      }
    }
    const lab = parsed.lab as LabProgress | undefined
    if (!lab || !Array.isArray(lab.completed)) return emptyProgress()
    return {
      lab: { completed: lab.completed },
      words: normalizeWords(parsed.words as WordsProgress | undefined),
      jumbled: normalizeJumbled(parsed.jumbled as JumbledProgress | undefined),
      countries: normalizeCountries(
        parsed.countries as CountriesProgress | undefined,
      ),
      space: normalizeSpace(parsed.space as SpaceProgress | undefined),
    }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: AppProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function clearProgress(): void {
  localStorage.removeItem(KEY)
}

export function completeStation(lab: LabProgress, id: StationId): LabProgress {
  if (lab.completed.includes(id)) return lab
  return { completed: [...lab.completed, id] }
}

export function isLabComplete(lab: LabProgress): boolean {
  return LAB_ORDER.every((id) => lab.completed.includes(id))
}

export function isLaptopUnlocked(lab: LabProgress): boolean {
  return isLabComplete(lab)
}

export function getLabStatus(
  lab: LabProgress,
  id: LabStationId,
): 'locked' | 'available' | 'done' {
  if (lab.completed.includes(id)) return 'done'
  const index = LAB_ORDER.indexOf(id)
  if (index === 0) return 'available'
  const prev = LAB_ORDER[index - 1]
  if (lab.completed.includes(prev)) return 'available'
  return 'locked'
}

/** Every theme is open — kids pick what they feel like typing today. */
export function getWordsStatus(
  words: WordsProgress,
  id: WordLevelId,
): 'locked' | 'available' | 'done' {
  return words.completedLevelIds.includes(id) ? 'done' : 'available'
}

export function completeWordLevel(
  words: WordsProgress,
  id: WordLevelId,
): WordsProgress {
  const completedLevelIds = words.completedLevelIds.includes(id)
    ? words.completedLevelIds
    : [...words.completedLevelIds, id]
  const unlocked = new Set<WordLevelId>(words.unlockedLevelIds)
  unlocked.add('animals')
  unlocked.add(id)
  const idx = WORD_LEVEL_ORDER.indexOf(id)
  const next = WORD_LEVEL_ORDER[idx + 1]
  if (next) unlocked.add(next)
  return {
    ...words,
    completedLevelIds,
    unlockedLevelIds: [...unlocked],
  }
}

export function recordTypedWord(words: WordsProgress): WordsProgress {
  return { ...words, wordsTypedCount: words.wordsTypedCount + 1 }
}

export function recordJumbledRound(
  jumbled: JumbledProgress,
  difficulty: JumbledDifficulty,
  stars: 1 | 2 | 3,
): JumbledProgress {
  const completedDifficulties = jumbled.completedDifficulties.includes(difficulty)
    ? jumbled.completedDifficulties
    : [...jumbled.completedDifficulties, difficulty]
  const prev = jumbled.bestStars[difficulty] ?? 0
  const bestStars = {
    ...jumbled.bestStars,
    [difficulty]: Math.max(prev, stars) as 1 | 2 | 3,
  }
  return { completedDifficulties, bestStars }
}

export function recordCountriesRound(
  countries: CountriesProgress,
  mode: CountriesMode,
  difficulty: CountriesDifficulty,
  stars: RoundStars,
): CountriesProgress {
  const key = `${mode}-${difficulty}` as CountriesModeKey
  const completedModes = countries.completedModes.includes(key)
    ? countries.completedModes
    : [...countries.completedModes, key]
  const bestStars = { ...countries.bestStars }
  if (stars >= 1) {
    const prev = bestStars[key] ?? 0
    bestStars[key] = Math.max(prev, stars) as 1 | 2 | 3
  }
  return { completedModes, bestStars }
}

export function recordMissionLearned(
  space: SpaceProgress,
  id: MissionId,
): SpaceProgress {
  if (space.learnedMissionIds.includes(id)) return space
  return { ...space, learnedMissionIds: [...space.learnedMissionIds, id] }
}

export function recordMissionQuiz(
  space: SpaceProgress,
  id: MissionId,
  stars: SpaceStars,
): SpaceProgress {
  if (stars === 0) return space
  const best = space.bestStars[id]
  if (best && best >= stars) return space
  return { ...space, bestStars: { ...space.bestStars, [id]: stars } }
}
