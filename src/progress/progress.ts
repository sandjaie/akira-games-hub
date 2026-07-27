import { LAB_ORDER } from '../content/stations'
import type { LabStationId, Progress, StationId } from '../types'

const KEY = 'cla-progress'

export { LAB_ORDER }

export function emptyProgress(): Progress {
  return { completed: [] }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Progress
    if (!parsed || !Array.isArray(parsed.completed)) return emptyProgress()
    return { completed: parsed.completed }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function clearProgress(): void {
  localStorage.removeItem(KEY)
}

export function completeStation(progress: Progress, id: StationId): Progress {
  if (progress.completed.includes(id)) return progress
  return { completed: [...progress.completed, id] }
}

export function isLabComplete(progress: Progress): boolean {
  return LAB_ORDER.every((id) => progress.completed.includes(id))
}

export function isLaptopUnlocked(progress: Progress): boolean {
  return isLabComplete(progress)
}

export function getLabStatus(
  progress: Progress,
  id: LabStationId,
): 'locked' | 'available' | 'done' {
  if (progress.completed.includes(id)) return 'done'
  const index = LAB_ORDER.indexOf(id)
  if (index === 0) return 'available'
  const prev = LAB_ORDER[index - 1]
  if (progress.completed.includes(prev)) return 'available'
  return 'locked'
}
