import { useEffect, useRef, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getCountry, ROUND_SIZE, type MapRegionId } from '../content/countries'
import { FlagSvg } from '../content/flags/FlagSvg'
import { ContinentMap } from '../content/maps/ContinentMap'
import {
  buildRound,
  isCorrectChoice,
  starsFromScore,
  type CountriesDifficulty,
  type CountriesMode,
  type CountriesQuestion,
  type RoundStars,
} from '../countries/quiz'

type Props = {
  mode: CountriesMode
  difficulty: CountriesDifficulty
  onBack: () => void
  onRoundComplete: (score: number, stars: RoundStars) => void
}

type Phase = 'ask' | 'reveal'

const PRAISE = ['Great!', 'Yes!', 'Awesome!', 'Nice find!', 'You got it!']

export function CountriesPlay({
  mode,
  difficulty,
  onBack,
  onRoundComplete,
}: Props) {
  const [round, setRound] = useState<CountriesQuestion[]>(() =>
    buildRound(mode, difficulty),
  )
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [picked, setPicked] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const question = round[index]
  const country = getCountry(question.countryId)

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    setRound(buildRound(mode, difficulty))
    setIndex(0)
    setScore(0)
    scoreRef.current = 0
    setPhase('ask')
    setPicked(null)
    setWasCorrect(false)
  }, [mode, difficulty])

  function answer(choice: string) {
    if (phase !== 'ask') return
    const ok = isCorrectChoice(question, choice)
    setPicked(choice)
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

  function finishOrNext() {
    playSfx('tap')
    if (index + 1 >= round.length) {
      const total = scoreRef.current
      onRoundComplete(total, starsFromScore(total))
      return
    }
    setIndex((i) => i + 1)
    setPhase('ask')
    setPicked(null)
    setWasCorrect(false)
  }

  const praise = PRAISE[index % PRAISE.length]
  const showNameChoices =
    question.kind === 'flags' || question.kind === 'maps-easy'

  return (
    <main className="screen countries-play">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onBack()
          }}
        >
          ← Back
        </button>
        <p className="eyebrow">
          {index + 1} / {ROUND_SIZE}
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
        <ContinentMap board={question.board} highlight={question.highlight} />
      ) : null}

      {question.kind === 'maps-medium' ? (
        <ContinentMap
          board={question.board}
          selectable
          selectedId={(picked as MapRegionId | null) ?? null}
          correctId={phase === 'reveal' ? question.countryId : null}
          wrongId={
            phase === 'reveal' && !wasCorrect
              ? ((picked as MapRegionId | null) ?? null)
              : null
          }
          disabled={phase !== 'ask'}
          onSelect={(id) => answer(id)}
        />
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
            Score {score} / {ROUND_SIZE}
          </p>
          <button type="button" onClick={finishOrNext}>
            {index + 1 >= round.length ? 'See stars' : 'Next →'}
          </button>
        </section>
      ) : null}
    </main>
  )
}
