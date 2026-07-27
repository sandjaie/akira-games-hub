import { describe, expect, it } from 'vitest'
import {
  emptySlots,
  isAnswerCorrect,
  revealFirstSlot,
  scrambleTiles,
  starsFromHints,
  tilesFromWord,
} from './scramble'

describe('tilesFromWord', () => {
  it('gives unique ids for repeated letters', () => {
    const tiles = tilesFromWord('BOOK')
    expect(tiles.map((t) => t.letter).join('')).toBe('BOOK')
    const ids = tiles.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(tiles.filter((t) => t.letter === 'O').map((t) => t.id)).toEqual([
      '1-O',
      '2-O',
    ])
  })
})

describe('scrambleTiles', () => {
  it('keeps the same multiset of letters', () => {
    const tiles = tilesFromWord('FROG')
    const scrambled = scrambleTiles(tiles, () => 0.3)
    expect(scrambled.map((t) => t.letter).sort().join('')).toBe(
      tiles.map((t) => t.letter).sort().join(''),
    )
  })

  it('differs from the answer when possible', () => {
    const tiles = tilesFromWord('CAT')
    // Deterministic sequence that still allows a non-identity shuffle
    let n = 0
    const values = [0.9, 0.1, 0.5, 0.2, 0.8, 0.3, 0.7, 0.4]
    const scrambled = scrambleTiles(tiles, () => values[n++ % values.length])
    expect(scrambled.map((t) => t.letter).join('')).not.toBe('CAT')
  })

  it('preserves tile ids (repeated letters stay distinct)', () => {
    const tiles = tilesFromWord('BALL')
    const scrambled = scrambleTiles(tiles, () => 0.42)
    expect(scrambled.map((t) => t.id).sort()).toEqual(
      tiles.map((t) => t.id).sort(),
    )
  })
})

describe('isAnswerCorrect', () => {
  it('requires all slots filled and matching the word', () => {
    const tiles = tilesFromWord('DOG')
    expect(isAnswerCorrect([tiles[0], tiles[1], null], 'DOG')).toBe(false)
    expect(isAnswerCorrect([tiles[0], tiles[1], tiles[2]], 'DOG')).toBe(true)
    expect(isAnswerCorrect([tiles[2], tiles[1], tiles[0]], 'DOG')).toBe(false)
  })
})

describe('revealFirstSlot', () => {
  it('places a correct first letter into slot 0', () => {
    const tiles = scrambleTiles(tilesFromWord('FISH'), () => 0.2)
    const { pool, slots } = revealFirstSlot(
      'FISH',
      tiles,
      emptySlots(4),
    )
    expect(slots[0]?.letter).toBe('F')
    expect(pool.some((t) => t.id === slots[0]?.id)).toBe(false)
  })
})

describe('starsFromHints', () => {
  it('awards more stars for fewer hints', () => {
    expect(starsFromHints(0)).toBe(3)
    expect(starsFromHints(1)).toBe(2)
    expect(starsFromHints(3)).toBe(1)
  })
})
