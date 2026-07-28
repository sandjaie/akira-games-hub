import { describe, expect, it } from 'vitest'
import {
  CHAPTER_COUNT,
  CHAPTERS,
  KURAL_COUNT,
  KURALS,
  PAAL_ORDER,
  chaptersForPaal,
  getChapter,
  getKural,
  kuralsForChapter,
} from './index'

describe('thirukkural content', () => {
  it('has all 1330 kurals and 133 chapters', () => {
    expect(KURAL_COUNT).toBe(1330)
    expect(CHAPTER_COUNT).toBe(133)
    expect(KURALS).toHaveLength(1330)
    expect(CHAPTERS).toHaveLength(133)
  })

  it('keeps kurals numbered 1..1330 in order', () => {
    expect(KURALS[0].number).toBe(1)
    expect(KURALS[1329].number).toBe(1330)
    for (let i = 0; i < KURALS.length; i++) {
      expect(KURALS[i].number).toBe(i + 1)
      expect(KURALS[i].line1.length).toBeGreaterThan(0)
      expect(KURALS[i].line2.length).toBeGreaterThan(0)
      expect(KURALS[i].meaningTa.length).toBeGreaterThan(0)
      expect(KURALS[i].meaningEn.length).toBeGreaterThan(0)
    }
  })

  it('covers every kural exactly once across chapters', () => {
    const seen = new Set<number>()
    for (const chapter of CHAPTERS) {
      expect(chapter.end - chapter.start).toBe(9)
      const kurals = kuralsForChapter(chapter.id)
      expect(kurals).toHaveLength(10)
      for (const k of kurals) {
        expect(seen.has(k.number)).toBe(false)
        seen.add(k.number)
      }
    }
    expect(seen.size).toBe(1330)
  })

  it('groups chapters into three paals', () => {
    expect(PAAL_ORDER).toEqual(['aram', 'porul', 'inbam'])
    expect(chaptersForPaal('aram').length).toBe(38)
    expect(chaptersForPaal('porul').length).toBe(70)
    expect(chaptersForPaal('inbam').length).toBe(25)
  })

  it('looks up chapter and kural helpers', () => {
    expect(getChapter(1).nameEn).toBe('Saying thanks to God')
    expect(getKural(1).meaningEn).toMatch(/alphabet/i)
    expect(getKural(11).meaningTa).toMatch(/மழை/)
  })
})
