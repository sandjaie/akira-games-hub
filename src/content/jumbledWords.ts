export type JumbledDifficulty = 'easy' | 'medium'

export type JumbledEntry = {
  word: string
  /** Easy: emoji clue. Medium: unused (category used instead). */
  emoji?: string
  /** Medium: category clue shown to the child. */
  category?: string
}

/** Familiar 3–4 letter words with picture/emoji clues */
export const JUMBLED_EASY: JumbledEntry[] = [
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
]

/** Familiar 5–7 letter words with category clues */
export const JUMBLED_MEDIUM: JumbledEntry[] = [
  { word: 'APPLE', category: 'Food' },
  { word: 'BREAD', category: 'Food' },
  { word: 'TIGER', category: 'Animals' },
  { word: 'HORSE', category: 'Animals' },
  { word: 'GREEN', category: 'Colors' },
  { word: 'BLACK', category: 'Colors' },
  { word: 'CHAIR', category: 'Home' },
  { word: 'TABLE', category: 'Home' },
  { word: 'CLOUD', category: 'Nature' },
  { word: 'RIVER', category: 'Nature' },
  { word: 'SMILE', category: 'Feelings' },
  { word: 'HAPPY', category: 'Feelings' },
  { word: 'DANCE', category: 'Play' },
  { word: 'JUMPING', category: 'Play' },
  { word: 'PENCIL', category: 'School' },
  { word: 'SCHOOL', category: 'School' },
  { word: 'SISTER', category: 'Family' },
  { word: 'MOTHER', category: 'Family' },
  { word: 'PLANET', category: 'Space' },
  { word: 'ROCKET', category: 'Space' },
]

export const ROUND_SIZE = 5

export function getJumbledPool(difficulty: JumbledDifficulty): JumbledEntry[] {
  return difficulty === 'easy' ? JUMBLED_EASY : JUMBLED_MEDIUM
}

/** Pick `count` unique entries (shuffled). */
export function pickRound(
  difficulty: JumbledDifficulty,
  count = ROUND_SIZE,
  random: () => number = Math.random,
): JumbledEntry[] {
  const pool = [...getJumbledPool(difficulty)]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length)).map((e) => ({
    ...e,
    word: e.word.toUpperCase(),
  }))
}
