import { describe, expect, it } from 'vitest'
import { FACT_BANK, dayNumber, factsForDay, moonPhaseForDay } from './spaceFacts'

describe('daily space content', () => {
  it('gives different facts on different days', () => {
    const day1 = factsForDay(new Date('2026-07-28T09:00:00Z')).map((f) => f.text)
    const day2 = factsForDay(new Date('2026-07-29T09:00:00Z')).map((f) => f.text)
    expect(day1).toHaveLength(3)
    expect(day1).not.toEqual(day2)
  })

  it('is stable within the same day', () => {
    const morning = factsForDay(new Date('2026-07-28T06:00:00Z'))
    const evening = factsForDay(new Date('2026-07-28T21:00:00Z'))
    expect(morning).toEqual(evening)
  })

  it('cycles through the whole bank before repeating', () => {
    const start = new Date('2026-01-01T12:00:00Z')
    const seen = new Set<string>()
    for (let d = 0; d < Math.ceil(FACT_BANK.length / 3); d += 1) {
      const day = new Date(start.getTime() + d * 86_400_000)
      for (const fact of factsForDay(day)) seen.add(fact.text)
    }
    expect(seen.size).toBe(FACT_BANK.length)
  })

  it('computes known moon phases', () => {
    // published 2026 dates: full Moon on 3 Jan, new Moon on 18 Jan
    expect(moonPhaseForDay(new Date('2026-01-03T12:00:00Z')).name).toBe(
      'full Moon',
    )
    expect(moonPhaseForDay(new Date('2026-01-18T20:00:00Z')).name).toBe(
      'new Moon',
    )
  })

  it('day numbers advance by one each day', () => {
    const a = dayNumber(new Date('2026-07-28T00:00:00Z'))
    const b = dayNumber(new Date('2026-07-29T23:59:00Z'))
    expect(b - a).toBe(1)
  })
})
