import { beforeEach, describe, expect, it } from 'vitest'
import { COUNTRIES, COUNTRY_ORDER, ROUND_SIZE } from '../content/countries'
import { clearSeen } from '../content/seen'
import {
  buildFlagQuestion,
  buildMapsEasyQuestion,
  buildMapsMediumQuestion,
  buildQuestion,
  buildRound,
  isCorrectChoice,
  modeKey,
  pickFlagDistractors,
  pickRoundCountries,
  starsFromScore,
} from './quiz'

/** Deterministic “random”: always picks the first eligible index. */
function sequential() {
  let i = 0
  return () => {
    i += 1
    return (i % 1000) / 1000
  }
}

describe('starsFromScore', () => {
  it('maps score out of five to stars', () => {
    expect(starsFromScore(5)).toBe(3)
    expect(starsFromScore(4)).toBe(2)
    expect(starsFromScore(3)).toBe(2)
    expect(starsFromScore(2)).toBe(1)
    expect(starsFromScore(1)).toBe(1)
    expect(starsFromScore(0)).toBe(0)
  })
})

describe('pickRoundCountries', () => {
  it('returns five unique countries', () => {
    const ids = pickRoundCountries(ROUND_SIZE, sequential())
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5)
  })
})

describe('flag distractors', () => {
  it('prefers similar flags for medium-style picks', () => {
    const france = COUNTRIES.france
    const picks = pickFlagDistractors(france, 3, () => 0)
    expect(picks).toHaveLength(3)
    expect(picks).not.toContain('france')
    expect(picks).toEqual(expect.arrayContaining(france.similarFlagIds))
  })

  it('easy flag questions use three choices', () => {
    const q = buildFlagQuestion('japan', 'easy', sequential())
    expect(q.choiceCount).toBe(3)
    expect(q.choices).toHaveLength(3)
    expect(q.choices).toContain('japan')
  })

  it('medium flag questions use four choices', () => {
    const q = buildFlagQuestion('japan', 'medium', sequential())
    expect(q.choiceCount).toBe(4)
    expect(q.choices).toHaveLength(4)
  })
})

describe('maps questions', () => {
  it('easy maps highlight the country with four name choices', () => {
    const q = buildMapsEasyQuestion('brazil', sequential())
    expect(q.kind).toBe('maps-easy')
    expect(q.highlight).toBe('brazil')
    expect(q.choices).toHaveLength(4)
    expect(q.choices).toContain('brazil')
  })

  it('medium maps expose four hotspots including the answer', () => {
    const q = buildMapsMediumQuestion('egypt')
    expect(q.hotspots).toHaveLength(4)
    expect(q.hotspots).toContain('egypt')
  })
})

describe('buildRound', () => {
  it('builds five questions for each mode/difficulty', () => {
    for (const mode of ['flags', 'maps'] as const) {
      for (const difficulty of ['easy', 'medium'] as const) {
        const round = buildRound(mode, difficulty, sequential())
        expect(round).toHaveLength(5)
        expect(isCorrectChoice(round[0], round[0].countryId)).toBe(true)
      }
    }
  })
})

describe('modeKey', () => {
  it('joins mode and difficulty', () => {
    expect(modeKey('flags', 'easy')).toBe('flags-easy')
    expect(modeKey('maps', 'medium')).toBe('maps-medium')
  })
})

describe('buildQuestion rotation', () => {
  beforeEach(() => {
    clearSeen()
  })

  it('asks every country once before repeating any', () => {
    const asked = Array.from({ length: COUNTRY_ORDER.length }, () =>
      buildQuestion('flags', 'easy').countryId,
    )
    expect(new Set(asked).size).toBe(COUNTRY_ORDER.length)
  })

  it('does not bring a country back for most of the next lap', () => {
    const asked = Array.from({ length: COUNTRY_ORDER.length * 2 }, () =>
      buildQuestion('flags', 'easy').countryId,
    )
    // gap between two askings of the same country, in questions
    const lastAt = new Map<string, number>()
    let closest = Infinity
    asked.forEach((id, at) => {
      const prev = lastAt.get(id)
      if (prev !== undefined) closest = Math.min(closest, at - prev)
      lastAt.set(id, at)
    })
    expect(closest).toBeGreaterThanOrEqual(COUNTRY_ORDER.length / 2)
  })

  it('rotates flags and maps independently', () => {
    const flags = buildQuestion('flags', 'easy').countryId
    const seenByMaps = Array.from({ length: COUNTRY_ORDER.length }, () =>
      buildQuestion('maps', 'easy').countryId,
    )
    // the maps lap still covers everything, including what flags just asked
    expect(seenByMaps).toContain(flags)
  })
})
