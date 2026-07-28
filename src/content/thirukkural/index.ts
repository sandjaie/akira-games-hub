import {
  CHAPTERS,
  PAAL_ORDER,
  PAALS,
  type Chapter,
  type PaalId,
} from './chapters.generated'
import { KURALS, type Kural } from './kurals.generated'

export type { Chapter, Kural, PaalId }
export { CHAPTERS, KURALS, PAAL_ORDER, PAALS }

const KURAL_BY_NUMBER = new Map(KURALS.map((k) => [k.number, k]))

export function getChapter(id: number): Chapter {
  const chapter = CHAPTERS.find((c) => c.id === id)
  if (!chapter) throw new Error(`unknown chapter ${id}`)
  return chapter
}

export function chaptersForPaal(paalId: PaalId): Chapter[] {
  return CHAPTERS.filter((c) => c.paalId === paalId)
}

export function kuralsForChapter(chapterId: number): Kural[] {
  const chapter = getChapter(chapterId)
  return KURALS.filter(
    (k) => k.number >= chapter.start && k.number <= chapter.end,
  )
}

export function getKural(number: number): Kural {
  const kural = KURAL_BY_NUMBER.get(number)
  if (!kural) throw new Error(`unknown kural ${number}`)
  return kural
}

export const KURAL_COUNT = KURALS.length
export const CHAPTER_COUNT = CHAPTERS.length
