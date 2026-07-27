import { describe, expect, it } from 'vitest'
import {
  COUNTRIES,
  COUNTRY_ORDER,
  MAP_BOARD_REGIONS,
  ROUND_SIZE,
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
