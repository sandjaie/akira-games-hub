import { describe, expect, it } from 'vitest'
import { WORD_LEVEL_ORDER, WORD_LEVELS } from './wordLevels'

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

  it('each level has query + fallback words of length 3–7', () => {
    for (const id of WORD_LEVEL_ORDER) {
      const level = WORD_LEVELS[id]
      expect(level.query.ml.length).toBeGreaterThan(0)
      expect(level.fallbackWords.length).toBeGreaterThanOrEqual(15)
      for (const word of level.fallbackWords) {
        expect(word).toMatch(/^[A-Z]{3,7}$/)
      }
      expect(new Set(level.fallbackWords).size).toBe(level.fallbackWords.length)
    }
  })
})
