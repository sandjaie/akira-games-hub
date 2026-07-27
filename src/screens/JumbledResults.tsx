import type { JumbledDifficulty } from '../content/jumbledWords'

type Props = {
  difficulty: JumbledDifficulty
  stars: 1 | 2 | 3
  onReplay: () => void
  onDifficulty: () => void
  onHub: () => void
}

export function JumbledResults({
  difficulty,
  stars,
  onReplay,
  onDifficulty,
  onHub,
}: Props) {
  const label = difficulty === 'easy' ? 'Easy' : 'Medium'

  return (
    <main className="screen jumbled-results">
      <h1 className="display cheer">You did it!</h1>
      <p className="subtitle">{label} round finished</p>
      <p className="jumbled-stars" aria-label={`${stars} stars`}>
        {'★'.repeat(stars)}
        <span className="jumbled-stars-empty" aria-hidden="true">
          {'☆'.repeat(3 - stars)}
        </span>
      </p>
      <p>Great unscrambling!</p>
      <div className="actions">
        <button type="button" onClick={onReplay}>
          Play again
        </button>
        <button type="button" className="secondary" onClick={onDifficulty}>
          Pick level
        </button>
        <button type="button" className="secondary" onClick={onHub}>
          Games
        </button>
      </div>
    </main>
  )
}
