import { describe, expect, it } from 'vitest'
import {
  COUNTRY_ORDER,
  MAP_BOARD_OF,
  MAP_BOARD_REGIONS,
  ROUND_SIZE,
  getInfo,
} from './countries'

describe('countries content', () => {
  it('gives every map country a board and a resolvable country', () => {
    expect(COUNTRY_ORDER).toHaveLength(12)
    for (const id of COUNTRY_ORDER) {
      expect(MAP_BOARD_OF[id]).toBeTruthy()
      const info = getInfo(id)
      expect(info.name.length).toBeGreaterThan(2)
      expect(info.capital.length).toBeGreaterThan(1)
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
  it('resolves a map slug and an ISO code to the same country', () => {
    const bySlug = getInfo('australia')
    const byCode = getInfo('au')
    expect(bySlug).toEqual(byCode)
    expect(byCode.name).toBe('Australia')
    expect(byCode.code).toBe('au')
    expect(byCode.continent).toBe('Oceania')
  })

  it('carries the capital and subregion the reveal card shows', () => {
    const peru = getInfo('pe')
    expect(peru.name).toBe('Peru')
    expect(peru.continent).toBe('South America')
    expect(peru.capital).toBe('Lima')
    expect(peru.subregion).toBe('South America')
  })

  it('resolves map-only hotspots too', () => {
    expect(getInfo('spain').name).toBe('Spain')
    expect(getInfo('mexico').capital).toBe('Mexico City')
  })
})
