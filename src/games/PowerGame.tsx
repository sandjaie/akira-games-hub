import { useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

export function PowerGame({ onComplete }: MiniGameProps) {
  const [plugged, setPlugged] = useState(false)
  const [hint, setHint] = useState('Tap the plug, then the socket.')

  return (
    <div className="game">
      <p className="game-hint">{hint}</p>
      <div className="power-board">
        <button
          type="button"
          className="plug"
          disabled={plugged}
          onClick={() => {
            playSfx('tap')
            setPlugged(true)
            setHint('Now flip the switch!')
          }}
        >
          🔌 Plug
        </button>
        <div className={`socket${plugged ? ' ready' : ''}`}>Socket</div>
        <button
          type="button"
          className="game-choice"
          disabled={!plugged}
          onClick={() => {
            playSfx('correct')
            onComplete()
          }}
        >
          Flip switch
        </button>
      </div>
    </div>
  )
}
