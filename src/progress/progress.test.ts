import { beforeEach, describe, expect, it } from 'vitest'
import { WORD_LEVEL_ORDER } from '../content/wordLevels'
import {
  LAB_ORDER,
  clearProgress,
  completeStation,
  completeWordLevel,
  getLabStatus,
  getWordsStatus,
  isLabComplete,
  isLaptopUnlocked,
  loadProgress,
  recordTypedWord,
  saveProgress,
} from './progress'

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear()
    clearProgress()
  })

  it('starts with only monitor available', () => {
    const p = loadProgress()
    expect(getLabStatus(p.lab, 'monitor')).toBe('available')
    expect(getLabStatus(p.lab, 'keyboard')).toBe('locked')
    expect(isLaptopUnlocked(p.lab)).toBe(false)
  })

  it('unlocks the next station after complete', () => {
    let p = loadProgress()
    p = { ...p, lab: completeStation(p.lab, 'monitor') }
    saveProgress(p)
    p = loadProgress()
    expect(getLabStatus(p.lab, 'monitor')).toBe('done')
    expect(getLabStatus(p.lab, 'keyboard')).toBe('available')
  })

  it('unlocks laptop after all lab stations', () => {
    let p = loadProgress()
    for (const id of LAB_ORDER) {
      p = { ...p, lab: completeStation(p.lab, id) }
    }
    expect(isLabComplete(p.lab)).toBe(true)
    expect(isLaptopUnlocked(p.lab)).toBe(true)
    p = { ...p, lab: completeStation(p.lab, 'laptop') }
    expect(p.lab.completed.includes('laptop')).toBe(true)
  })

  it('keeps finished stations replayable (still done)', () => {
    const lab = completeStation(loadProgress().lab, 'monitor')
    expect(getLabStatus(lab, 'monitor')).toBe('done')
  })

  it('migrates legacy lab-only progress', () => {
    localStorage.setItem('cla-progress', JSON.stringify({ completed: ['monitor'] }))
    const p = loadProgress()
    expect(p.lab.completed).toEqual(['monitor'])
    expect(p.words.unlockedLevelIds).toContain('animals')
    expect(getWordsStatus(p.words, 'animals')).toBe('available')
    expect(getWordsStatus(p.words, 'colors')).toBe('locked')
  })

  it('unlocks next word level after clear', () => {
    let words = loadProgress().words
    words = completeWordLevel(words, 'animals')
    expect(getWordsStatus(words, 'animals')).toBe('done')
    expect(getWordsStatus(words, 'colors')).toBe('available')
    words = recordTypedWord(words)
    expect(words.wordsTypedCount).toBe(1)
  })

  it('keeps animals unlocked even if storage omits it', () => {
    saveProgress({
      lab: { completed: [] },
      words: {
        unlockedLevelIds: [],
        completedLevelIds: [],
        wordsTypedCount: 0,
      },
    })
    const p = loadProgress()
    expect(p.words.unlockedLevelIds).toContain('animals')
  })

  it('word level order matches content module', () => {
    expect(WORD_LEVEL_ORDER[0]).toBe('animals')
  })
})
