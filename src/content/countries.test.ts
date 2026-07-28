import { describe, expect, it } from 'vitest'
import {
  COUNTRIES,
  COUNTRY_ORDER,
  MAP_BOARD_REGIONS,
  ROUND_SIZE,
  getInfo,
} from './countries'

describe('countries content', () => {
  it('has twelve curated countries', () => {
    expect(COUNTRY_ORDER).toHaveLength(12)
    for (const id of COUNTRY_ORDER) {
      const c = COUNTRIES[id]
      expect(c.id).toBe(id)
      expect(c.name.length).toBeGreaterThan(2)
      expect(c.fact.length).toBeGreaterThan(10)
      expect(c.mapBoard).toBeTruthy()
    }
  })

  it('map boards always expose four regions', () => {
    for (const regions of Object.values(MAP_BOARD_REGIONS)) {
      expect(regions).toHaveLength(4)
    }
  })

  it('round size is five', () => {
    expect(ROUND_SIZE).toBe(5)
  })
})

describe('getInfo', () => {
  it('keeps the hand-written fact whether asked by slug or by code', () => {
    const bySlug = getInfo('australia')
    const byCode = getInfo('au')
    expect(bySlug.fact).toBe(COUNTRIES.australia.fact)
    expect(byCode.fact).toBe(COUNTRIES.australia.fact)
    expect(byCode.name).toBe('Australia')
    expect(byCode.code).toBe('au')
  })

  it('falls back to the capital for countries with no written fact', () => {
    const peru = getInfo('pe')
    expect(peru.name).toBe('Peru')
    expect(peru.continent).toBe('South America')
    expect(peru.fact).toBe('Lima is the capital of Peru.')
  })
})
