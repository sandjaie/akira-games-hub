import { describe, expect, it } from 'vitest'
import { MISSIONS } from '../content/space'
import { buildMissionQuiz, nextQuestion, starsFromScore } from './quiz'

const sequential = () => {
  let i = 0
  const values = [0.1, 0.9, 0.4, 0.7, 0.2, 0.6, 0.3, 0.8]
  return () => values[i++ % values.length]
}

describe('space quiz', () => {
  it('uses every mission question once per pass', () => {
    const quiz = buildMissionQuiz('planets', sequential())
    expect(quiz).toHaveLength(MISSIONS.planets.questions.length)
    expect(new Set(quiz.map((q) => q.id)).size).toBe(quiz.length)
  })

  it('keeps the answer inside the shuffled choices', () => {
    for (const q of buildMissionQuiz('moon', sequential())) {
      expect(q.choices.map((c) => c.id)).toContain(q.answerId)
    }
  })

  it('refills the queue so play never runs out', () => {
    const first = nextQuestion('sky-science', [], sequential())
    expect(first.question).toBeTruthy()
    const drained = nextQuestion('sky-science', [], sequential())
    expect(drained.queue.length).toBe(
      MISSIONS['sky-science'].questions.length - 1,
    )
  })

  it('scores stars by share of correct answers', () => {
    expect(starsFromScore(0, 0)).toBe(0)
    expect(starsFromScore(0, 4)).toBe(0)
    expect(starsFromScore(1, 4)).toBe(1)
    expect(starsFromScore(3, 5)).toBe(2)
    expect(starsFromScore(7, 7)).toBe(3)
  })
})
