import { describe, expect, it } from 'vitest'
import { WORD_LEVEL_ORDER, WORD_LEVELS } from './wordLevels'

describe('wordLevels', () => {
  it('has ten levels in unlock order', () => {
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
    ])
  })

  it('each level has 8–12 uppercase A–Z words of length 3–6', () => {
    for (const id of WORD_LEVEL_ORDER) {
      const level = WORD_LEVELS[id]
      expect(level.words.length).toBeGreaterThanOrEqual(8)
      expect(level.words.length).toBeLessThanOrEqual(12)
      for (const word of level.words) {
        expect(word).toMatch(/^[A-Z]{3,6}$/)
      }
    }
  })
})
