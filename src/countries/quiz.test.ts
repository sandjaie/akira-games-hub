import { beforeEach, describe, expect, it } from 'vitest'
import {
  COUNTRY_ORDER,
  continentOfCode,
  flagPool,
} from '../content/countries'
import { clearSeen } from '../content/seen'
import {
  buildFlagQuestion,
  buildMapsEasyQuestion,
  buildMapsMediumQuestion,
  buildQuestion,
  modeKey,
  pickFlagDistractors,
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

describe('flag distractors', () => {
  it('draws wrong answers from the same continent first', () => {
    const picks = pickFlagDistractors('pe', flagPool('medium'), 3, () => 0)
    expect(picks).toHaveLength(3)
    expect(picks).not.toContain('pe')
    expect(picks.map(continentOfCode)).toEqual([
      'South America',
      'South America',
      'South America',
    ])
  })

  it('falls back past the continent when it runs out', () => {
    // Oceania has few countries in the Easy pool, so it must reach further
    const picks = pickFlagDistractors('au', flagPool('easy'), 3, () => 0)
    expect(picks).toHaveLength(3)
    expect(picks).not.toContain('au')
  })

  it('easy flag questions use three choices', () => {
    const q = buildFlagQuestion('jp', 'easy', sequential())
    expect(q.choiceCount).toBe(3)
    expect(q.choices).toHaveLength(3)
    expect(q.choices).toContain('jp')
  })

  it('medium flag questions use four choices', () => {
    const q = buildFlagQuestion('jp', 'medium', sequential())
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

  it('asks every flag once before repeating any', () => {
    const pool = flagPool('easy')
    const asked = Array.from(
      { length: pool.length },
      () => buildQuestion('flags', 'easy').countryId,
    )
    expect(new Set(asked).size).toBe(pool.length)
  })

  it('does not bring a country back for most of the next lap', () => {
    const size = COUNTRY_ORDER.length
    const asked = Array.from(
      { length: size * 2 },
      () => buildQuestion('maps', 'easy').countryId,
    )
    // closest gap between two askings of the same country, in questions
    const lastAt = new Map<string, number>()
    let closest = Infinity
    asked.forEach((id, at) => {
      const prev = lastAt.get(id)
      if (prev !== undefined) closest = Math.min(closest, at - prev)
      lastAt.set(id, at)
    })
    expect(closest).toBeGreaterThanOrEqual(size / 2)
  })

  it('rotates flags and maps independently', () => {
    // a full lap of flags must not eat into the maps rotation
    const pool = flagPool('easy')
    for (let i = 0; i < pool.length; i += 1) buildQuestion('flags', 'easy')
    const maps = Array.from(
      { length: COUNTRY_ORDER.length },
      () => buildQuestion('maps', 'easy').countryId,
    )
    expect(new Set(maps).size).toBe(COUNTRY_ORDER.length)
  })

  it('keeps easy and medium pools on separate rotations', () => {
    const easy = flagPool('easy')
    for (let i = 0; i < easy.length; i += 1) buildQuestion('flags', 'easy')
    const medium = flagPool('medium')
    const asked = Array.from(
      { length: medium.length },
      () => buildQuestion('flags', 'medium').countryId,
    )
    expect(new Set(asked).size).toBe(medium.length)
  })
})
