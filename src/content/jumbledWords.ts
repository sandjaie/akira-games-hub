import { preferFresh, shuffle } from './wordApi'

export type JumbledDifficulty = 'easy' | 'medium'

export type JumbledEntry = {
  word: string
  emoji?: string
  category?: string
}

export const ROUND_SIZE = 5

const EASY_FALLBACK: JumbledEntry[] = [
  { word: 'CAT', emoji: '🐱' },
  { word: 'DOG', emoji: '🐶' },
  { word: 'SUN', emoji: '☀️' },
  { word: 'BED', emoji: '🛏️' },
  { word: 'CUP', emoji: '🥤' },
  { word: 'FISH', emoji: '🐟' },
  { word: 'BIRD', emoji: '🐦' },
  { word: 'FROG', emoji: '🐸' },
  { word: 'DUCK', emoji: '🦆' },
  { word: 'BALL', emoji: '⚽' },
  { word: 'BOOK', emoji: '📖' },
  { word: 'TREE', emoji: '🌳' },
  { word: 'STAR', emoji: '⭐' },
  { word: 'MOON', emoji: '🌙' },
  { word: 'CAKE', emoji: '🎂' },
  { word: 'MILK', emoji: '🥛' },
  { word: 'HAND', emoji: '✋' },
  { word: 'FOOT', emoji: '🦶' },
  { word: 'RAIN', emoji: '🌧️' },
  { word: 'SNOW', emoji: '❄️' },
  { word: 'COW', emoji: '🐮' },
  { word: 'PIG', emoji: '🐷' },
  { word: 'CAR', emoji: '🚗' },
  { word: 'BUS', emoji: '🚌' },
  { word: 'BIKE', emoji: '🚲' },
  { word: 'BOAT', emoji: '🚤' },
  { word: 'LEAF', emoji: '🍃' },
  { word: 'EGG', emoji: '🥚' },
  { word: 'PEAR', emoji: '🍐' },
  { word: 'TOY', emoji: '🧸' },
]

const MEDIUM_FALLBACK: JumbledEntry[] = [
  { word: 'APPLE', category: 'Food' },
  { word: 'BREAD', category: 'Food' },
  { word: 'TIGER', category: 'Animals' },
  { word: 'HORSE', category: 'Animals' },
  { word: 'GREEN', category: 'Colors' },
  { word: 'PURPLE', category: 'Colors' },
  { word: 'CHAIR', category: 'Home' },
  { word: 'WINDOW', category: 'Home' },
  { word: 'CLOUD', category: 'Nature' },
  { word: 'FLOWER', category: 'Nature' },
  { word: 'SMILE', category: 'Feelings' },
  { word: 'HAPPY', category: 'Feelings' },
  { word: 'DANCE', category: 'Play' },
  { word: 'PUZZLE', category: 'Play' },
  { word: 'PENCIL', category: 'School' },
  { word: 'SCHOOL', category: 'School' },
  { word: 'SISTER', category: 'Family' },
  { word: 'MOTHER', category: 'Family' },
  { word: 'PLANET', category: 'Space' },
  { word: 'ROCKET', category: 'Space' },
  { word: 'TRAIN', category: 'Transport' },
  { word: 'PLANE', category: 'Transport' },
  { word: 'RABBIT', category: 'Animals' },
  { word: 'BANANA', category: 'Food' },
  { word: 'YELLOW', category: 'Colors' },
  { word: 'GARDEN', category: 'Nature' },
  { word: 'FRIEND', category: 'Feelings' },
  { word: 'TEACHER', category: 'School' },
  { word: 'BROTHER', category: 'Family' },
  { word: 'GALAXY', category: 'Space' },
]

export const JUMBLED_EASY = EASY_FALLBACK
export const JUMBLED_MEDIUM = MEDIUM_FALLBACK

export function getJumbledPool(difficulty: JumbledDifficulty): JumbledEntry[] {
  return difficulty === 'easy' ? EASY_FALLBACK : MEDIUM_FALLBACK
}

/** Offline shuffle pick (used as fallback). */
export function pickRound(
  difficulty: JumbledDifficulty,
  count = ROUND_SIZE,
  random: () => number = Math.random,
): JumbledEntry[] {
  const pool = shuffle([...getJumbledPool(difficulty)], random)
  return preferFresh(pool, count, (e) => e.word)
}

/** Curated rounds keep picture clues and categories accurate for young kids. */
export async function loadJumbledRound(
  difficulty: JumbledDifficulty,
  count = ROUND_SIZE,
): Promise<JumbledEntry[]> {
  return pickRound(difficulty, count)
}
