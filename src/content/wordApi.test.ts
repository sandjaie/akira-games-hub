import { describe, expect, it } from 'vitest'
import {
  filterKidWords,
  normalizeWord,
  preferFresh,
  shuffle,
} from './wordApi'

describe('wordApi filters', () => {
  it('normalizes and rejects non letters', () => {
    expect(normalizeWord('  cat ')).toBe('CAT')
    expect(normalizeWord('hot dog')).toBe(null)
    expect(normalizeWord('hi!')).toBe(null)
  })

  it('filters by length and blocklist', () => {
    const words = filterKidWords(
      ['cat', 'elephant', 'ass', 'DOG', 'bird'],
      { min: 3, max: 4 },
    )
    expect(words).toEqual(['CAT', 'DOG', 'BIRD'])
  })

  it('shuffle keeps the same items', () => {
    const input = ['A', 'B', 'C', 'D']
    expect(shuffle(input, () => 0.2).sort()).toEqual(input)
  })
})

describe('preferFresh', () => {
  it('remembers picked words in sessionStorage', () => {
    sessionStorage.clear()
    const picked = preferFresh(
      ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'BEAR'],
      3,
    )
    expect(picked).toHaveLength(3)
    const stored = JSON.parse(sessionStorage.getItem('akira-recent-words')!)
    expect(stored.length).toBeGreaterThanOrEqual(3)
  })
})
