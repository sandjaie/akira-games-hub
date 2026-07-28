import { useEffect, useRef, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getMission, type MissionId, type SpaceQuestion } from '../content/space'
import { SpaceArt } from '../content/space/SpaceArt'
import { buildMissionQuiz, starsFromScore, type SpaceStars } from '../space/quiz'

type Props = {
  missionId: MissionId
  onBack: () => void
  onFinish: (score: number, asked: number, stars: SpaceStars) => void
}

const PRAISE = ['Great!', 'Yes!', 'Space expert!', 'Spot on!', 'You got it!']

export function SpacePlay({ missionId, onBack, onFinish }: Props) {
  const mission = getMission(missionId)
  const [queue, setQueue] = useState<SpaceQuestion[]>(() =>
    buildMissionQuiz(missionId),
  )
  const [asked, setAsked] = useState(1)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [picked, setPicked] = useState<string | null>(null)

  const question = queue[0]
  const wasCorrect = picked === question?.answerId

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    setQueue(buildMissionQuiz(missionId))
    setAsked(1)
    setScore(0)
    scoreRef.current = 0
    setPicked(null)
  }, [missionId])

  function answer(choiceId: string) {
    if (picked) return
    setPicked(choiceId)
    if (choiceId === question.answerId) {
      playSfx('correct')
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      playSfx('wrong')
    }
  }

  function nextQuestion() {
    playSfx('tap')
    // one question at a time, reshuffling the mission pool when it runs dry
    const rest = queue.slice(1)
    setQueue(rest.length > 0 ? rest : buildMissionQuiz(missionId))
    setAsked((n) => n + 1)
    setPicked(null)
  }

  /** Back means "that's enough" — show the stars for what was played. */
  function stop() {
    playSfx('tap')
    const answered = picked ? asked : asked - 1
    if (answered <= 0) {
      onBack()
      return
    }
    onFinish(
      scoreRef.current,
      answered,
      starsFromScore(scoreRef.current, answered),
    )
  }

  if (!question) return null

  return (
    <main className="screen space-play">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={stop}>
          ← Back
        </button>
        <p className="eyebrow">
          Question {asked} · Score {score}
        </p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <p className="eyebrow space-mission-tag">
        {mission.emoji} {mission.title}
      </p>
      <h1 className="display space-prompt">{question.prompt}</h1>

      <div className="space-choices" role="group" aria-label="Answers">
        {question.choices.map((choice) => {
          let cls = 'space-choice'
          if (picked) {
            if (choice.id === question.answerId) cls += ' correct'
            else if (choice.id === picked) cls += ' wrong'
          }
          return (
            <button
              key={choice.id}
              type="button"
              className={cls}
              disabled={Boolean(picked)}
              onClick={() => answer(choice.id)}
            >
              <SpaceArt kind={choice.art} className="choice-art" />
              <span className="choice-label">{choice.label}</span>
            </button>
          )
        })}
      </div>

      {picked ? (
        <section
          className={`space-reveal${wasCorrect ? ' ok' : ' no'}`}
          aria-live="polite"
        >
          <p className="space-feedback">
            {wasCorrect ? PRAISE[asked % PRAISE.length] : 'Not that one —'}
          </p>
          <p className="space-explain">{question.explain}</p>
          <button type="button" onClick={nextQuestion}>
            Next →
          </button>
          <button type="button" className="secondary" onClick={stop}>
            That’s enough
          </button>
        </section>
      ) : null}
    </main>
  )
}
