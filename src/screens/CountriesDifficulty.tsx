import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import {
  modeKey,
  type CountriesDifficulty,
  type CountriesMode,
} from '../countries/quiz'
import type { CountriesProgress } from '../types'

type Props = {
  mode: CountriesMode
  countries: CountriesProgress
  onBack: () => void
  onPick: (difficulty: CountriesDifficulty) => void
}

function starsLabel(n: 1 | 2 | 3 | undefined): string {
  if (!n) return ''
  return '★'.repeat(n)
}

export function CountriesDifficulty({
  mode,
  countries,
  onBack,
  onPick,
}: Props) {
  const modeTitle = mode === 'flags' ? 'Flags' : 'Maps'
  const easyKey = modeKey(mode, 'easy')
  const mediumKey = modeKey(mode, 'medium')

  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen countries-difficulty">
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
          ← Modes
        </button>
        <p className="eyebrow">{modeTitle}</p>
        <span className="words-top-spacer" />
      </div>
      <h1 className="display">Pick a level</h1>
      <p className="subtitle">Five friendly questions</p>
      <div className="hub-cards jumbled-diff-cards">
        <button
          type="button"
          className="hub-card jumbled-easy"
          onClick={() => {
            playSfx('tap')
            onPick('easy')
          }}
          aria-label={`Easy. ${
            mode === 'flags'
              ? 'Flag with three country names.'
              : 'Highlighted country with three names.'
          }${countries.bestStars[easyKey] ? ` Best ${countries.bestStars[easyKey]} stars.` : ''}`}
        >
          <span className="hub-icon" aria-hidden="true">
            🌱
          </span>
          <span>
            <span className="hub-title">Easy</span>
            <span className="hub-blurb">
              {mode === 'flags' ? '3 big choices' : 'Find the highlighted land'}
            </span>
            {countries.bestStars[easyKey] ? (
              <span className="jumbled-best" aria-hidden="true">
                Best {starsLabel(countries.bestStars[easyKey])}
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
          aria-label={`Medium. ${
            mode === 'flags'
              ? 'Flag with four trickier choices.'
              : 'Tap the country on the map.'
          }${countries.bestStars[mediumKey] ? ` Best ${countries.bestStars[mediumKey]} stars.` : ''}`}
        >
          <span className="hub-icon" aria-hidden="true">
            🚀
          </span>
          <span>
            <span className="hub-title">Medium</span>
            <span className="hub-blurb">
              {mode === 'flags' ? '4 similar flags' : 'Tap the right spot'}
            </span>
            {countries.bestStars[mediumKey] ? (
              <span className="jumbled-best" aria-hidden="true">
                Best {starsLabel(countries.bestStars[mediumKey])}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    </main>
  )
}
