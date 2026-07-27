import { useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

const CHOICES = [
  { id: 'sun', label: '☀️ Sun', correct: true },
  { id: 'car', label: '🚗 Car', correct: false },
  { id: 'tree', label: '🌳 Tree', correct: false },
]

export function MonitorGame({ onComplete }: MiniGameProps) {
  const [hint, setHint] = useState('')

  return (
    <div className="game">
      <p className="game-hint">Tap the sun on the Screen.</p>
      <div className="game-choices">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="game-choice"
            onClick={() => {
              if (choice.correct) {
                playSfx('correct')
                onComplete()
              } else {
                playSfx('wrong')
                setHint('Try again!')
              }
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p className="try-again" aria-live="polite">
        {hint}
      </p>
    </div>
  )
}
