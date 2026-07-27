import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import type { JumbledDifficulty } from '../content/jumbledWords'
import type { JumbledProgress } from '../types'

type Props = {
  jumbled: JumbledProgress
  onBack: () => void
  onPick: (difficulty: JumbledDifficulty) => void
}

function starsLabel(n: 1 | 2 | 3 | undefined): string {
  if (!n) return ''
  return '★'.repeat(n)
}

export function JumbledDifficulty({ jumbled, onBack, onPick }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen jumbled-difficulty">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Games
        </button>
        <p className="eyebrow">Jumbled Words</p>
        <span className="words-top-spacer" />
      </div>
      <h1 className="display">Pick a level</h1>
      <p className="subtitle">Unscramble the letters!</p>
      <div className="hub-cards jumbled-diff-cards">
        <button
          type="button"
          className="hub-card jumbled-easy"
          onClick={() => {
            playSfx('tap')
            onPick('easy')
          }}
          aria-label={`Easy. Short words with a picture clue.${jumbled.bestStars.easy ? ` Best ${jumbled.bestStars.easy} stars.` : ''}`}
        >
          <span className="hub-icon" aria-hidden="true">
            🌱
          </span>
          <span>
            <span className="hub-title">Easy</span>
            <span className="hub-blurb">Short words + pictures</span>
            {jumbled.bestStars.easy ? (
              <span className="jumbled-best" aria-hidden="true">
                Best {starsLabel(jumbled.bestStars.easy)}
              </span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          className="hub-card jumbled-medium"
          onClick={() => {
            playSfx('tap')
            onPick('medium')
          }}
          aria-label={`Medium. Longer words with a category clue.${jumbled.bestStars.medium ? ` Best ${jumbled.bestStars.medium} stars.` : ''}`}
        >
          <span className="hub-icon" aria-hidden="true">
            🚀
          </span>
          <span>
            <span className="hub-title">Medium</span>
            <span className="hub-blurb">Longer words + category</span>
            {jumbled.bestStars.medium ? (
              <span className="jumbled-best" aria-hidden="true">
                Best {starsLabel(jumbled.bestStars.medium)}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    </main>
  )
}
