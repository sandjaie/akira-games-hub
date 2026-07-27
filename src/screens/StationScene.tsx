import { useRef, useState } from 'react'
import { STATIONS } from '../content/stations'
import { gameRegistry } from '../games/gameRegistry'
import type { LabStationId } from '../types'

type Props = {
  stationId: LabStationId
  onBack: () => void
  onCompletedStation: (id: LabStationId) => void
}

type Phase = 'story' | 'play' | 'reward'

export function StationScene({
  stationId,
  onBack,
  onCompletedStation,
}: Props) {
  const station = STATIONS[stationId]
  const [phase, setPhase] = useState<Phase>('story')
  const completedRef = useRef(false)
  const Game = gameRegistry[station.game]

  const handleComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true
      onCompletedStation(stationId)
    }
    setPhase('reward')
  }

  return (
    <main className="screen station">
      <div className="top-bar">
        <button type="button" onClick={onBack}>
          Back to map
        </button>
      </div>

      {phase === 'story' ? (
        <section className="station-panel">
          <h1 className="display">{station.kidName}</h1>
          {station.grownUpWord ? (
            <p className="grown-up">Grown-up word: {station.grownUpWord}</p>
          ) : null}
          <p>{station.blurb[0]}</p>
          <p>{station.blurb[1]}</p>
          <div className="actions">
            <button type="button" onClick={() => setPhase('play')}>
              Play!
            </button>
          </div>
        </section>
      ) : null}

      {phase === 'play' ? (
        <section className="station-panel">
          <h1 className="display">{station.kidName}</h1>
          <Game onComplete={handleComplete} />
        </section>
      ) : null}

      {phase === 'reward' ? (
        <section className="reward">
          <h2 className="display">You found it!</h2>
          <p>Nice exploring.</p>
          <div className="actions">
            <button type="button" onClick={onBack}>
              Back to map
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}
