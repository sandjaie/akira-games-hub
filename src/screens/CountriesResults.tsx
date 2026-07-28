import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import type {
  CountriesDifficulty,
  CountriesMode,
  RoundStars,
} from '../countries/quiz'

type Props = {
  mode: CountriesMode
  difficulty: CountriesDifficulty
  score: number
  asked: number
  stars: RoundStars
  onReplay: () => void
  onModes: () => void
  onHub: () => void
}

export function CountriesResults({
  mode,
  difficulty,
  score,
  asked,
  stars,
  onReplay,
  onModes,
  onHub,
}: Props) {
  const modeLabel = mode === 'flags' ? 'Flags' : 'Maps'
  const diffLabel = difficulty === 'easy' ? 'Easy' : 'Medium'

  useEffect(() => {
    stopBgm()
    playSfx('cheer')
  }, [])

  return (
    <main className="screen countries-results">
      <SoundToggle active={false} />
      <h1 className="display cheer">You did it!</h1>
      <p className="subtitle">
        {modeLabel} · {diffLabel}
      </p>
      <p className="countries-final-score" aria-label={`Score ${score} out of ${asked}`}>
        {score} / {asked} correct
      </p>
      <p className="jumbled-stars" aria-label={`${stars} stars`}>
        {'★'.repeat(stars)}
        <span className="jumbled-stars-empty" aria-hidden="true">
          {'☆'.repeat(3 - stars)}
        </span>
      </p>
      <p>Keep exploring the world!</p>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            onReplay()
          }}
        >
          Play again
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onModes()
          }}
        >
          Change mode
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onHub()
          }}
        >
          Games
        </button>
      </div>
    </main>
  )
}
