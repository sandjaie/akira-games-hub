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

  it('keeps English substitutions from breaking longer words', () => {
    const blob = KURALS.map((k) => k.meaningEn).join('\n')
    expect(blob).not.toMatch(/leaderdom/i)
    expect(blob).not.toMatch(/goodnesss/i)
    expect(blob).not.toMatch(/wopeople/i)
    // kingdom must survive the king→leader swap
    expect(getKural(445).meaningEn).toMatch(/kingdom/i)
  })

  it('applies age-safety across every book, not only Book III', () => {
    for (const k of KURALS) {
      expect(k.meaningEn).not.toMatch(/prostitut|harlot|courtesan|wanton|concubine|adulter/i)
      expect(k.meaningTa).not.toMatch(/பாலியல்|விலைமகள்|விலைமகளிர்|பரத்தை/)
    }
    expect(getKural(911).meaningEn).toMatch(/sweet words/i)
    expect(getKural(911).meaningTa).toMatch(/துன்பம்/)
  })

  it('does not end kid English on mid-clause fragments', () => {
    for (const k of KURALS) {
      expect(k.meaningEn).not.toMatch(/,\s*(?:and|or|who)\.$/i)
      expect(k.meaningEn).not.toMatch(/\bwho\.$/i)
    }
  })
})
