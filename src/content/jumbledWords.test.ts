import { describe, expect, it } from 'vitest'
import { JUMBLED_EASY, JUMBLED_MEDIUM, pickRound } from './jumbledWords'

describe('jumbledWords', () => {
  it('easy fallback is 3–4 letters with emoji', () => {
    expect(JUMBLED_EASY.length).toBeGreaterThanOrEqual(20)
    for (const entry of JUMBLED_EASY) {
      expect(entry.word).toMatch(/^[A-Z]{3,4}$/)
      expect(entry.emoji).toBeTruthy()
    }
  })

  it('medium fallback is 5–7 letters with category', () => {
    expect(JUMBLED_MEDIUM.length).toBeGreaterThanOrEqual(20)
    for (const entry of JUMBLED_MEDIUM) {
      expect(entry.word).toMatch(/^[A-Z]{5,7}$/)
      expect(entry.category).toBeTruthy()
    }
  })

  it('pickRound returns five unique words', () => {
    sessionStorage.clear()
    const round = pickRound('easy', 5, () => 0.42)
    expect(round).toHaveLength(5)
    expect(new Set(round.map((e) => e.word)).size).toBe(5)
  })
})
