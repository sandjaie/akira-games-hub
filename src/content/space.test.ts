import { describe, expect, it } from 'vitest'
import { CURATED_MISSION_IDS, MISSIONS, MISSION_ORDER } from './space'

describe('space missions', () => {
  it('has a daily section plus seven curated missions', () => {
    expect(MISSION_ORDER[0]).toBe('today')
    expect(CURATED_MISSION_IDS).toHaveLength(7)
  })

  it('teaches 3-5 cards before asking at least five questions', () => {
    for (const id of CURATED_MISSION_IDS) {
      const mission = MISSIONS[id]
      expect(mission.id).toBe(id)
      expect(mission.cards.length).toBeGreaterThanOrEqual(3)
      expect(mission.cards.length).toBeLessThanOrEqual(5)
      expect(mission.questions.length).toBeGreaterThanOrEqual(5)
      for (const card of mission.cards) {
        expect(card.title.length).toBeGreaterThan(5)
        expect(card.lines.length).toBeGreaterThan(0)
      }
    }
  })

  it('every question has a real answer, distinct choices and an explanation', () => {
    for (const id of CURATED_MISSION_IDS) {
      for (const q of MISSIONS[id].questions) {
        expect(q.choices.length).toBeGreaterThanOrEqual(3)
        const ids = q.choices.map((c) => c.id)
        expect(new Set(ids).size).toBe(ids.length)
        expect(ids).toContain(q.answerId)
        expect(q.explain.length).toBeGreaterThan(10)
      }
    }
  })

  it('question ids are unique inside a mission', () => {
    for (const id of CURATED_MISSION_IDS) {
      const ids = MISSIONS[id].questions.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('teaches the far side, and only says "dark side" to correct it', () => {
    const moon = JSON.stringify(MISSIONS.moon).toLowerCase()
    expect(moon).toContain('far side')
    // the phrase may only appear as "not a dark side"
    const stray = moon.split('dark side').slice(0, -1).filter((before) => {
      return !before.endsWith('not a ')
    })
    expect(stray).toEqual([])
  })
})
