import { beforeEach, describe, expect, it } from 'vitest'
import {
  LAB_ORDER,
  clearProgress,
  completeStation,
  getLabStatus,
  isLabComplete,
  isLaptopUnlocked,
  loadProgress,
  saveProgress,
} from './progress'

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear()
    clearProgress()
  })

  it('starts with only monitor available', () => {
    const p = loadProgress()
    expect(getLabStatus(p, 'monitor')).toBe('available')
    expect(getLabStatus(p, 'keyboard')).toBe('locked')
    expect(isLaptopUnlocked(p)).toBe(false)
  })

  it('unlocks the next station after complete', () => {
    let p = loadProgress()
    p = completeStation(p, 'monitor')
    saveProgress(p)
    p = loadProgress()
    expect(getLabStatus(p, 'monitor')).toBe('done')
    expect(getLabStatus(p, 'keyboard')).toBe('available')
  })

  it('unlocks laptop after all lab stations', () => {
    let p = loadProgress()
    for (const id of LAB_ORDER) {
      p = completeStation(p, id)
    }
    expect(isLabComplete(p)).toBe(true)
    expect(isLaptopUnlocked(p)).toBe(true)
    p = completeStation(p, 'laptop')
    expect(p.completed.includes('laptop')).toBe(true)
  })

  it('keeps finished stations replayable (still done)', () => {
    const p = completeStation(loadProgress(), 'monitor')
    expect(getLabStatus(p, 'monitor')).toBe('done')
  })
})
