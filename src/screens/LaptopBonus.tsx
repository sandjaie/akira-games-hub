import { useState } from 'react'
import { EXPLORER_NAME } from '../content/explorer'

type Pair = { id: string; label: string; spot: string }

const PAIRS: Pair[] = [
  { id: 'screen', label: 'Screen', spot: 'Lid screen' },
  { id: 'brain', label: 'Brain', spot: 'Tiny brain' },
  { id: 'keyboard', label: 'Keyboard', spot: 'Keys' },
  { id: 'storage', label: 'Storage', spot: 'Keep box' },
]

type Props = {
  onBack: () => void
  onComplete: () => void
}

export function LaptopBonus({ onBack, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [hint, setHint] = useState('')

  const tryMatch = (spotId: string) => {
    if (matched.includes(spotId)) return
    if (!selected) {
      setHint('Tap a part first!')
      return
    }
    if (selected === spotId) {
      const next = [...matched, spotId]
      setMatched(next)
      setSelected(null)
      setHint('Yes!')
      if (next.length === PAIRS.length) {
        onComplete()
      }
    } else {
      setHint('Try again!')
      setSelected(null)
    }
  }

  return (
    <main className="screen laptop">
      <div className="top-bar">
        <button type="button" onClick={onBack}>
          Back to map
        </button>
      </div>
      <section className="station-panel">
        <h1 className="display">Laptop peek</h1>
        <p>{EXPLORER_NAME}, a laptop has the same friends inside!</p>
        <p>Match each part to its cozy spot.</p>
        <div className="laptop-board">
          <div className="match-labels">
            {PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                className={`match-label${selected === pair.id ? ' selected' : ''}${matched.includes(pair.id) ? ' used' : ''}`}
                disabled={matched.includes(pair.id)}
                onClick={() => {
                  setSelected(pair.id)
                  setHint('')
                }}
              >
                {pair.label}
              </button>
            ))}
          </div>
          <div className="laptop-shell" aria-label="Laptop inside">
            {PAIRS.map((pair) => (
              <button
                key={pair.spot}
                type="button"
                className={`spot${matched.includes(pair.id) ? ' filled' : ''}`}
                onClick={() => tryMatch(pair.id)}
              >
                {matched.includes(pair.id) ? `★ ${pair.label}` : pair.spot}
              </button>
            ))}
          </div>
          <p className="try-again" aria-live="polite">
            {hint}
          </p>
        </div>
      </section>
    </main>
  )
}
