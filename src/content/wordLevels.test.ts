import { describe, expect, it } from 'vitest'
import { loadLevelWords, WORD_LEVEL_ORDER, WORD_LEVELS } from './wordLevels'

describe('wordLevels', () => {
  it('has twelve levels in unlock order', () => {
    expect(WORD_LEVEL_ORDER).toEqual([
      'animals',
      'colors',
      'school',
      'home',
      'play',
      'food',
      'nature',
      'family',
      'body',
      'weather',
      'transport',
      'feelings',
    ])
  })

  it('each level has kid words of length 3–7', () => {
    for (const id of WORD_LEVEL_ORDER) {
      const level = WORD_LEVELS[id]
      expect(level.words.length).toBeGreaterThanOrEqual(15)
      for (const word of level.words) {
        expect(word).toMatch(/^[A-Z]{3,7}$/)
      }
      expect(new Set(level.words).size).toBe(level.words.length)
    }
  })

  it('a round is ten words with no repeats', () => {
    sessionStorage.clear()
    const round = loadLevelWords('animals')
    expect(round).toHaveLength(10)
    expect(new Set(round.map((e) => e.word)).size).toBe(10)
  })
})
