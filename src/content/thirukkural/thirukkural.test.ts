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
  it('ships kid-safe chapters only (no Kaamathupaal / adult adhikarams)', () => {
    // 133 total − 25 Love − 3 adult Aram/Porul chapters (15, 91, 92)
    expect(CHAPTER_COUNT).toBe(105)
    expect(KURAL_COUNT).toBe(1050)
    expect(KURALS).toHaveLength(1050)
    expect(CHAPTERS).toHaveLength(105)
    expect(CHAPTERS.some((c) => c.paalId === ('inbam' as never))).toBe(false)
    expect(CHAPTERS.some((c) => [15, 91, 92].includes(c.id))).toBe(false)
    expect(KURALS.some((k) => k.number >= 1081)).toBe(false)
    expect(KURALS.some((k) => k.number >= 141 && k.number <= 150)).toBe(false)
    expect(KURALS.some((k) => k.number >= 901 && k.number <= 920)).toBe(false)
  })

  it('keeps included kurals well-formed and in ascending order', () => {
    expect(KURALS[0].number).toBe(1)
    expect(KURALS[KURALS.length - 1].number).toBe(1080)
    for (let i = 1; i < KURALS.length; i++) {
      expect(KURALS[i].number).toBeGreaterThan(KURALS[i - 1].number)
    }
    for (const k of KURALS) {
      expect(k.line1.length).toBeGreaterThan(0)
      expect(k.line2.length).toBeGreaterThan(0)
      expect(k.meaningTa.length).toBeGreaterThan(0)
      expect(k.meaningEn.length).toBeGreaterThan(0)
    }
  })

  it('covers every included kural exactly once across chapters', () => {
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
    expect(seen.size).toBe(KURAL_COUNT)
  })

  it('groups chapters into two kid books', () => {
    expect(PAAL_ORDER).toEqual(['aram', 'porul'])
    expect(chaptersForPaal('aram').length).toBe(37)
    expect(chaptersForPaal('porul').length).toBe(68)
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
    expect(getKural(734).meaningEn).toMatch(/kingdom/i)
  })

  it('applies age-safety across the shipped dataset', () => {
    for (const k of KURALS) {
      expect(k.meaningEn).not.toMatch(
        /prostitut|harlot|courtesan|wanton|concubine|adulter|sexual|embrace|lovers?/i,
      )
      expect(k.meaningTa).not.toMatch(
        /பாலியல்|விலைமகள்|விலைமகளிர்|பரத்தை|புணர்ச்சி|காமம்|காதல் நுகர்ச்சி/,
      )
    }
  })

  it('does not end kid English on mid-clause fragments', () => {
    for (const k of KURALS) {
      expect(k.meaningEn).not.toMatch(/,\s*(?:and|or|who)\.$/i)
      expect(k.meaningEn).not.toMatch(/\bwho\.$/i)
    }
  })

  it('does not cut meanings mid-word', () => {
    for (const k of KURALS) {
      // Lone-letter stubs like " h." — not the "t." in "can't."
      expect(k.meaningEn).not.toMatch(/\s[b-hj-zB-HJ-Z]\.$/)
      expect(k.meaningEn).not.toMatch(/\bgoo\.$/i)
      expect(k.meaningTa).not.toMatch(/\sவேண\.$/)
    }
    // Codex examples that used to ship truncated
    expect(getKural(157).meaningEn).not.toMatch(/goo\.$/i)
    expect(getKural(276).meaningEn).not.toMatch(/\sh\.$/i)
    expect(getKural(638).meaningTa).not.toMatch(/வேண\.$/)
  })
})
