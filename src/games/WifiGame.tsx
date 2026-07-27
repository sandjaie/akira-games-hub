import { useState } from 'react'
import type { MiniGameProps } from './types'

export function WifiGame({ onComplete }: MiniGameProps) {
  const [step, setStep] = useState(0)
  const [hint, setHint] = useState('')

  return (
    <div className="game">
      <p className="game-hint">Tap the dots in order: 1, then 2, then 3.</p>
      <div className="wifi-path">
        {[0, 1, 2].map((dot) => (
          <button
            key={dot}
            type="button"
            className={`dot${dot < step ? ' done' : ''}${dot === step ? ' next' : ''}`}
            onClick={() => {
              if (dot === step) {
                const next = step + 1
                setStep(next)
                setHint('')
                if (next >= 3) onComplete()
              } else {
                setHint('Try again!')
              }
            }}
          >
            {dot + 1}
          </button>
        ))}
      </div>
      <p className="try-again" aria-live="polite">
        {hint}
      </p>
    </div>
  )
}
