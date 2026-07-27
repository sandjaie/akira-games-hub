export type LetterTile = {
  id: string
  letter: string
}

/** Build tiles with stable unique IDs so repeated letters stay distinct. */
export function tilesFromWord(word: string): LetterTile[] {
  return word
    .toUpperCase()
    .split('')
    .map((letter, index) => ({ id: `${index}-${letter}`, letter }))
}

/**
 * Fisher–Yates scramble. Retries so the joined letters differ from the
 * answer when at least one alternate order exists.
 */
export function scrambleTiles(
  tiles: LetterTile[],
  random: () => number = Math.random,
  maxAttempts = 20,
): LetterTile[] {
  const answer = tiles.map((t) => t.letter).join('')
  if (tiles.length <= 1) return [...tiles]

  let best = [...tiles]
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const next = [...tiles]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    best = next
    if (next.map((t) => t.letter).join('') !== answer) return next
  }
  return best
}

export function slotsToWord(slots: Array<LetterTile | null>): string {
  return slots.map((s) => s?.letter ?? '').join('')
}

export function isAnswerCorrect(
  slots: Array<LetterTile | null>,
  word: string,
): boolean {
  if (slots.some((s) => s === null)) return false
  return slotsToWord(slots) === word.toUpperCase()
}

export function emptySlots(length: number): Array<LetterTile | null> {
  return Array.from({ length }, () => null)
}

/** Place the correct first-letter tile into slot 0 (for medium hint). */
export function revealFirstSlot(
  word: string,
  pool: LetterTile[],
  slots: Array<LetterTile | null>,
): { pool: LetterTile[]; slots: Array<LetterTile | null> } {
  const target = word.toUpperCase()[0]
  const nextSlots = [...slots]
  const nextPool = [...pool]

  // Return whatever is in slot 0 to the pool first
  const occupying = nextSlots[0]
  if (occupying) {
    nextPool.push(occupying)
    nextSlots[0] = null
  }

  const idx = nextPool.findIndex((t) => t.letter === target)
  if (idx === -1) return { pool: nextPool, slots: nextSlots }
  const [tile] = nextPool.splice(idx, 1)
  nextSlots[0] = tile
  return { pool: nextPool, slots: nextSlots }
}

export type RoundStars = 1 | 2 | 3

/** Fewer hints → more stars. */
export function starsFromHints(hintsUsed: number): RoundStars {
  if (hintsUsed <= 0) return 3
  if (hintsUsed <= 2) return 2
  return 1
}
