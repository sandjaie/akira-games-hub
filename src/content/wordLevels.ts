export type WordLevelId = 'animals' | 'colors' | 'school' | 'home' | 'play'

export type WordLevel = {
  id: WordLevelId
  title: string
  emoji: string
  words: string[]
}

export const WORD_LEVEL_ORDER: WordLevelId[] = [
  'animals',
  'colors',
  'school',
  'home',
  'play',
]

export const WORD_LEVELS: Record<WordLevelId, WordLevel> = {
  animals: {
    id: 'animals',
    title: 'Animals',
    emoji: '🐾',
    words: ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'BEAR'],
  },
  colors: {
    id: 'colors',
    title: 'Colors',
    emoji: '🎨',
    words: ['RED', 'BLUE', 'PINK', 'GOLD', 'GREEN'],
  },
  school: {
    id: 'school',
    title: 'School',
    emoji: '📚',
    words: ['BOOK', 'PEN', 'DESK', 'BAG', 'READ'],
  },
  home: {
    id: 'home',
    title: 'Home',
    emoji: '🏠',
    words: ['BED', 'DOOR', 'CUP', 'LAMP', 'SOFA'],
  },
  play: {
    id: 'play',
    title: 'Play',
    emoji: '🎮',
    words: ['BALL', 'GAME', 'JUMP', 'SING', 'DRAW'],
  },
}

export function getWordLevel(id: WordLevelId): WordLevel {
  return WORD_LEVELS[id]
}
