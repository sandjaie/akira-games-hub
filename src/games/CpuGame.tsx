import { useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

type Card = { id: number; face: string; pair: string }

const DECK: Card[] = [
  { id: 1, face: '⚡', pair: 'a' },
  { id: 2, face: '⚡', pair: 'a' },
  { id: 3, face: '🧠', pair: 'b' },
  { id: 4, face: '🧠', pair: 'b' },
]

export function CpuGame({ onComplete }: MiniGameProps) {
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [lock, setLock] = useState(false)

  const onCard = (card: Card) => {
    if (lock || matched.includes(card.pair) || flipped.includes(card.id)) return
    playSfx('tap')
    const next = [...flipped, card.id]
    setFlipped(next)
    if (next.length < 2) return

    const [a, b] = next.map((id) => DECK.find((c) => c.id === id)!)
    setLock(true)
    if (a.pair === b.pair) {
      const pairs = [...matched, a.pair]
      setMatched(pairs)
      setFlipped([])
      setLock(false)
      playSfx(pairs.length === 2 ? 'word' : 'correct')
      if (pairs.length === 2) onComplete()
    } else {
      playSfx('wrong')
      window.setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 550)
    }
  }

  return (
    <div className="game">
      <p className="game-hint">Match the pairs. Think fast!</p>
      <div className="game-grid">
        {DECK.map((card) => {
          const show = flipped.includes(card.id) || matched.includes(card.pair)
          return (
            <button
              key={card.id}
              type="button"
              className={`card${show ? ' flipped' : ''}`}
              onClick={() => onCard(card)}
            >
              {show ? card.face : '?'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
