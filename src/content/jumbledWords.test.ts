import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  JUMBLED_EASY,
  JUMBLED_MEDIUM,
  loadJumbledRound,
  pickRound,
} from './jumbledWords'

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('keeps easy picture clues tied to their curated words', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () =>
          ['fuel', 'diet', 'feed', 'meal', 'fare', 'meat'].map((word) => ({
            word,
          })),
      }),
    )
    sessionStorage.clear()

    const round = await loadJumbledRound('easy')
    const expectedClues = new Map(
      JUMBLED_EASY.map((entry) => [entry.word, entry.emoji]),
    )

    expect(round).toHaveLength(5)
    for (const entry of round) {
      expect(entry.emoji).toBe(expectedClues.get(entry.word))
    }
  })

  it('keeps medium categories tied to their curated words', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () =>
          ['money', 'energy', 'island', 'summer', 'music', 'bright'].map(
            (word) => ({ word }),
          ),
      }),
    )
    sessionStorage.clear()

    const round = await loadJumbledRound('medium')
    const expectedCategories = new Map(
      JUMBLED_MEDIUM.map((entry) => [entry.word, entry.category]),
    )

    expect(round).toHaveLength(5)
    for (const entry of round) {
      expect(entry.category).toBe(expectedCategories.get(entry.word))
    }
  })
})
