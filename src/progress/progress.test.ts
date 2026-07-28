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
  recordChapterRead,
  recordCountriesRound,
  recordJumbledRound,
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
    expect(getWordsStatus(p.words, 'colors')).toBe('available')
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
      jumbled: { completedDifficulties: [], bestStars: {} },
      countries: { completedModes: [], bestStars: {} },
      space: { learnedMissionIds: [], bestStars: {} },
      tamizh: { readChapterIds: [] },
    })
    const p = loadProgress()
    expect(p.words.unlockedLevelIds).toContain('animals')
  })

  it('migrates progress missing jumbled bucket', () => {
    localStorage.setItem(
      'cla-progress',
      JSON.stringify({
        lab: { completed: ['monitor'] },
        words: {
          unlockedLevelIds: ['animals'],
          completedLevelIds: [],
          wordsTypedCount: 2,
        },
      }),
    )
    const p = loadProgress()
    expect(p.lab.completed).toEqual(['monitor'])
    expect(p.jumbled.completedDifficulties).toEqual([])
    expect(p.jumbled.bestStars).toEqual({})
    expect(p.countries.completedModes).toEqual([])
  })

  it('migrates progress missing countries bucket', () => {
    localStorage.setItem(
      'cla-progress',
      JSON.stringify({
        lab: { completed: ['monitor'] },
        words: {
          unlockedLevelIds: ['animals'],
          completedLevelIds: [],
          wordsTypedCount: 0,
        },
        jumbled: { completedDifficulties: ['easy'], bestStars: { easy: 2 } },
      }),
    )
    const p = loadProgress()
    expect(p.jumbled.bestStars.easy).toBe(2)
    expect(p.countries.completedModes).toEqual([])
    expect(p.countries.bestStars).toEqual({})
  })

  it('records best jumbled stars without lowering a higher score', () => {
    let jumbled = loadProgress().jumbled
    jumbled = recordJumbledRound(jumbled, 'easy', 2)
    jumbled = recordJumbledRound(jumbled, 'easy', 3)
    jumbled = recordJumbledRound(jumbled, 'easy', 1)
    expect(jumbled.completedDifficulties).toContain('easy')
    expect(jumbled.bestStars.easy).toBe(3)
  })

  it('records best countries stars per mode without lowering', () => {
    let countries = loadProgress().countries
    countries = recordCountriesRound(countries, 'flags', 'easy', 2)
    countries = recordCountriesRound(countries, 'flags', 'easy', 3)
    countries = recordCountriesRound(countries, 'flags', 'easy', 1)
    countries = recordCountriesRound(countries, 'maps', 'medium', 0)
    expect(countries.completedModes).toContain('flags-easy')
    expect(countries.completedModes).toContain('maps-medium')
    expect(countries.bestStars['flags-easy']).toBe(3)
    expect(countries.bestStars['maps-medium']).toBeUndefined()
  })

  it('word level order matches content module', () => {
    expect(WORD_LEVEL_ORDER[0]).toBe('animals')
  })

  it('migrates progress missing tamizh bucket', () => {
    localStorage.setItem(
      'cla-progress',
      JSON.stringify({
        lab: { completed: ['monitor'] },
        words: {
          unlockedLevelIds: ['animals'],
          completedLevelIds: [],
          wordsTypedCount: 0,
        },
        jumbled: { completedDifficulties: [], bestStars: {} },
        countries: { completedModes: [], bestStars: {} },
        space: { learnedMissionIds: [], bestStars: {} },
      }),
    )
    const p = loadProgress()
    expect(p.tamizh.readChapterIds).toEqual([])
  })

  it('records read thirukkural chapters without duplicates', () => {
    let tamizh = loadProgress().tamizh
    tamizh = recordChapterRead(tamizh, 1)
    tamizh = recordChapterRead(tamizh, 1)
    tamizh = recordChapterRead(tamizh, 2)
    expect(tamizh.readChapterIds).toEqual([1, 2])
  })
})
