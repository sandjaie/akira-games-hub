import { useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

const WORD = 'CAT'
const KEYS = ['C', 'A', 'T', 'B', 'S', 'M']

export function KeyboardGame({ onComplete }: MiniGameProps) {
  const [index, setIndex] = useState(0)
  const [hint, setHint] = useState('')

  const typed = WORD.slice(0, index)

  return (
    <div className="game">
      <p className="game-hint">Type the word CAT.</p>
      <p className="word-progress">{typed.padEnd(WORD.length, '_')}</p>
      <div className="keys">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="key"
            onClick={() => {
              if (key === WORD[index]) {
                const next = index + 1
                setIndex(next)
                setHint('')
                playSfx(next >= WORD.length ? 'word' : 'correct')
                if (next >= WORD.length) onComplete()
              } else {
                playSfx('wrong')
                setHint('Try again!')
              }
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <p className="try-again" aria-live="polite">
        {hint}
      </p>
    </div>
  )
}
