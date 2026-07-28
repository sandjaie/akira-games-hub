import { useEffect, useRef, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getCountry, type MapRegionId } from '../content/countries'
import { FlagSvg } from '../content/flags/FlagSvg'
import { ContinentMap } from '../content/maps/ContinentMap'
import {
  buildQuestion,
  isCorrectChoice,
  starsFromScore,
  type CountriesDifficulty,
  type CountriesMode,
  type RoundStars,
} from '../countries/quiz'

type Props = {
  mode: CountriesMode
  difficulty: CountriesDifficulty
  onBack: () => void
  onRoundComplete: (score: number, asked: number, stars: RoundStars) => void
}

type Phase = 'ask' | 'reveal'

const PRAISE = ['Great!', 'Yes!', 'Awesome!', 'Nice find!', 'You got it!']

export function CountriesPlay({
  mode,
  difficulty,
  onBack,
  onRoundComplete,
}: Props) {
  const [question, setQuestion] = useState(() =>
    buildQuestion(mode, difficulty),
  )
  const [asked, setAsked] = useState(1)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [picked, setPicked] = useState<string | null>(null)
  const [nudge, setNudge] = useState('')
  const [wasCorrect, setWasCorrect] = useState(false)

  const country = getCountry(question.countryId)

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    setQuestion(buildQuestion(mode, difficulty))
    setAsked(1)
    setScore(0)
    scoreRef.current = 0
    setPhase('ask')
    setPicked(null)
    setNudge('')
    setWasCorrect(false)
  }, [mode, difficulty])

  function answer(choice: string) {
    if (phase !== 'ask') return
    const ok = isCorrectChoice(question, choice)
    setPicked(choice)
    setNudge('')
    setWasCorrect(ok)
    setPhase('reveal')
    if (ok) {
      playSfx('correct')
      scoreRef.current += 1
      setScore(scoreRef.current)
    } else {
      playSfx('wrong')
    }
  }

  function nextQuestion() {
    playSfx('tap')
    setQuestion(buildQuestion(mode, difficulty, question.countryId))
    setAsked((n) => n + 1)
    setPhase('ask')
    setPicked(null)
    setNudge('')
    setWasCorrect(false)
  }

  /** Back doubles as "that's enough" — show stars for whatever was played. */
  function stop() {
    playSfx('tap')
    const answered = phase === 'reveal' ? asked : asked - 1
    if (answered <= 0) {
      onBack()
      return
    }
    onRoundComplete(
      scoreRef.current,
      answered,
      starsFromScore(scoreRef.current, answered),
    )
  }

  const praise = PRAISE[asked % PRAISE.length]
  const showNameChoices =
    question.kind === 'flags' || question.kind === 'maps-easy'
  const revealedId = phase === 'reveal' ? question.countryId : null

  return (
    <main className="screen countries-play">
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

      <h1 className="display countries-prompt">
        {question.kind === 'maps-medium'
          ? `Where is ${country.name}?`
          : 'Which country is this?'}
      </h1>

      {question.kind === 'flags' ? (
        <div className="flag-stage">
          <FlagSvg
            id={question.countryId}
            className="flag-hero"
            title="Mystery flag"
          />
        </div>
      ) : null}

      {question.kind === 'maps-easy' ? (
        <ContinentMap
          board={question.board}
          highlight={question.highlight}
          correctId={revealedId}
        />
      ) : null}

      {question.kind === 'maps-medium' ? (
        <ContinentMap
          board={question.board}
          selectable
          selectedId={(picked as MapRegionId | null) ?? null}
          correctId={revealedId}
          wrongId={
            phase === 'reveal' && !wasCorrect
              ? ((picked as MapRegionId | null) ?? null)
              : null
          }
          disabled={phase !== 'ask'}
          onSelect={(id) => answer(id)}
          onMiss={() => {
            playSfx('hint')
            setNudge(`Tap a country to find ${country.name}.`)
          }}
        />
      ) : null}

      {question.kind === 'maps-medium' && phase === 'ask' ? (
        <p className="map-nudge" aria-live="polite">
          {nudge}
        </p>
      ) : null}

      {showNameChoices ? (
        <div
          className="countries-choices"
          role="group"
          aria-label="Country choices"
        >
          {question.choices.map((id) => {
            const c = getCountry(id)
            let cls = 'countries-choice'
            if (phase === 'reveal') {
              if (id === question.countryId) cls += ' correct'
              else if (id === picked) cls += ' wrong'
            }
            return (
              <button
                key={id}
                type="button"
                className={cls}
                disabled={phase !== 'ask'}
                aria-label={c.name}
                onClick={() => answer(id)}
              >
                {c.name}
              </button>
            )
          })}
        </div>
      ) : null}

      {phase === 'reveal' ? (
        <section
          className={`countries-reveal${wasCorrect ? ' ok' : ' no'}`}
          aria-live="polite"
        >
          <p className="countries-feedback">
            {wasCorrect ? praise : `It’s ${country.name}!`}
          </p>
          <p className="countries-meta">
            <strong>{country.name}</strong> · {country.continent}
          </p>
          <p className="countries-fact">{country.fact}</p>
          <p className="countries-score-live" aria-hidden="true">
            Score {score} / {asked}
          </p>
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
