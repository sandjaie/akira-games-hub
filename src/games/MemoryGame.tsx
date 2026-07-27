import { useEffect, useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

const SEQUENCE = [0, 2, 1]

export function MemoryGame({ onComplete }: MiniGameProps) {
  const [phase, setPhase] = useState<'watch' | 'play'>('watch')
  const [lit, setLit] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [hint, setHint] = useState('Watch the lights...')

  useEffect(() => {
    let i = 0
    const timers: number[] = []
    const play = () => {
      if (i >= SEQUENCE.length) {
        timers.push(
          window.setTimeout(() => {
            setLit(null)
            setPhase('play')
            setHint('Now tap them in order!')
          }, 400),
        )
        return
      }
      setLit(SEQUENCE[i])
      playSfx('hint')
      timers.push(
        window.setTimeout(() => {
          setLit(null)
          timers.push(
            window.setTimeout(() => {
              i += 1
              play()
            }, 250),
          )
        }, 550),
      )
    }
    play()
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  return (
    <div className="game">
      <p className="game-hint">{hint}</p>
      <div className="memory-pads">
        {[0, 1, 2].map((pad) => (
          <button
            key={pad}
            type="button"
            className={`pad${lit === pad ? ' lit' : ''}`}
            disabled={phase !== 'play'}
            onClick={() => {
              if (pad === SEQUENCE[step]) {
                const next = step + 1
                setStep(next)
                setHint('')
                playSfx(next >= SEQUENCE.length ? 'word' : 'correct')
                if (next >= SEQUENCE.length) onComplete()
              } else {
                playSfx('wrong')
                setStep(0)
                setHint('Try again from the start!')
              }
            }}
          >
            {pad + 1}
          </button>
        ))}
      </div>
      <p className="try-again" aria-live="polite">
        {phase === 'play' ? hint : ''}
      </p>
    </div>
  )
}
