import {
  CURATED_MISSION_IDS,
  getMission,
  type MissionId,
  type SpaceQuestion,
} from '../content/space'
import { dayNumber } from '../content/spaceFacts'

export type SpaceStars = 0 | 1 | 2 | 3

/** Shuffled mission questions, and the choices inside each one. */
export function buildMissionQuiz(
  missionId: MissionId,
  random: () => number = Math.random,
  now = new Date(),
): SpaceQuestion[] {
  const pool =
    missionId === 'today' ? dailyMixedPool(now) : getMission(missionId).questions
  return shuffle(pool, random).map((q) => ({
    ...q,
    choices: shuffle(q.choices, random),
  }))
}

/**
 * Today's quiz is a different handful from every mission each day, so the
 * daily section never asks the same set twice in a row.
 */
export function dailyMixedPool(now = new Date(), size = 8): SpaceQuestion[] {
  const all = CURATED_MISSION_IDS.flatMap((id) =>
    getMission(id).questions.map((q) => ({ ...q, id: `${id}:${q.id}` })),
  )
  const start = (dayNumber(now) * size) % all.length
  return Array.from({ length: size }, (_, i) => all[(start + i) % all.length])
}

/** Endless play: keep pulling questions, reshuffling once the pool runs out. */
export function nextQuestion(
  missionId: MissionId,
  queue: SpaceQuestion[],
  random: () => number = Math.random,
): { question: SpaceQuestion; queue: SpaceQuestion[] } {
  const pool = queue.length > 0 ? queue : buildMissionQuiz(missionId, random)
  const [question, ...rest] = pool
  return { question, queue: rest }
}

/** Share of answers right: all→3, 60%+→2, any→1, none→0. */
export function starsFromScore(correct: number, asked: number): SpaceStars {
  if (asked <= 0) return 0
  const share = correct / asked
  if (share <= 0) return 0
  if (share >= 1) return 3
  if (share >= 0.6) return 2
  return 1
}

function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
