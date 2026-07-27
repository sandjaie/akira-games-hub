import { describe, expect, it } from 'vitest'
import { WORD_LEVEL_ORDER, WORD_LEVELS } from './wordLevels'

describe('wordLevels', () => {
  it('has five levels in unlock order', () => {
    expect(WORD_LEVEL_ORDER).toEqual([
      'animals',
      'colors',
      'school',
      'home',
      'play',
    ])
  })

  it('each level has 5–8 uppercase A–Z words of length 3–5', () => {
    for (const id of WORD_LEVEL_ORDER) {
      const level = WORD_LEVELS[id]
      expect(level.words.length).toBeGreaterThanOrEqual(5)
      expect(level.words.length).toBeLessThanOrEqual(8)
      for (const word of level.words) {
        expect(word).toMatch(/^[A-Z]{3,5}$/)
      }
    }
  })
})
