import { useState } from 'react'
import type { MiniGameProps } from './types'

const LEVELS = [
  { id: 'quiet', label: 'Quiet' },
  { id: 'medium', label: 'Medium' },
  { id: 'loud', label: 'Loud' },
]

export function SpeakersGame({ onComplete }: MiniGameProps) {
  const [step, setStep] = useState(0)
  const [hint, setHint] = useState('')

  return (
    <div className="game">
      <p className="game-hint">Tap Quiet, then Medium, then Loud.</p>
      <div className="volume-row">
        {LEVELS.map((level, index) => (
          <button
            key={level.id}
            type="button"
            className="game-choice"
            onClick={() => {
              if (index === step) {
                const next = step + 1
                setStep(next)
                setHint('')
                if (next >= LEVELS.length) onComplete()
              } else {
                setHint('Try again!')
              }
            }}
          >
            {level.label}
          </button>
        ))}
      </div>
      <p className="try-again" aria-live="polite">
        {hint}
      </p>
    </div>
  )
}
