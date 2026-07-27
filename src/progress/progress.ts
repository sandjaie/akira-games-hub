import { LAB_ORDER } from '../content/stations'
import { WORD_LEVEL_ORDER, type WordLevelId } from '../content/wordLevels'
import type {
  AppProgress,
  LabProgress,
  LabStationId,
  StationId,
  WordsProgress,
} from '../types'

const KEY = 'cla-progress'

export { LAB_ORDER }

export function emptyWordsProgress(): WordsProgress {
  return {
    unlockedLevelIds: ['animals'],
    completedLevelIds: [],
    wordsTypedCount: 0,
  }
}

export function emptyProgress(): AppProgress {
  return { lab: { completed: [] }, words: emptyWordsProgress() }
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

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed && Array.isArray(parsed.completed) && !parsed.lab) {
      return {
        lab: { completed: parsed.completed as StationId[] },
        words: emptyWordsProgress(),
      }
    }
    const lab = parsed.lab as LabProgress | undefined
    if (!lab || !Array.isArray(lab.completed)) return emptyProgress()
    return {
      lab: { completed: lab.completed },
      words: normalizeWords(parsed.words as WordsProgress | undefined),
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

export function getWordsStatus(
  words: WordsProgress,
  id: WordLevelId,
): 'locked' | 'available' | 'done' {
  if (words.completedLevelIds.includes(id)) return 'done'
  if (id === 'animals' || words.unlockedLevelIds.includes(id)) return 'available'
  return 'locked'
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
