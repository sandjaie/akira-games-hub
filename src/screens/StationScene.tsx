import { useEffect, useRef, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { STATIONS } from '../content/stations'
import { gameRegistry } from '../games/gameRegistry'
import type { LabStationId } from '../types'

type Props = {
  name: string
  stationId: LabStationId
  onBack: () => void
  onCompletedStation: (id: LabStationId) => void
}

type Phase = 'story' | 'play' | 'reward'

export function StationScene({
  name,
  stationId,
  onBack,
  onCompletedStation,
}: Props) {
  const station = STATIONS[stationId]
  const [phase, setPhase] = useState<Phase>('story')
  const completedRef = useRef(false)
  const Game = gameRegistry[station.game]

  useEffect(() => {
    stopBgm()
  }, [])

  const handleComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true
      onCompletedStation(stationId)
    }
    playSfx('cheer')
    setPhase('reward')
  }

  return (
    <main className="screen station">
      <SoundToggle active={false} />
      <div className="top-bar">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            onBack()
          }}
        >
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
            <button
              type="button"
              onClick={() => {
                playSfx('whoosh')
                setPhase('play')
              }}
            >
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
          <h2 className="display">You found it, {name}!</h2>
          <p>Nice exploring.</p>
          <div className="actions">
            <button
              type="button"
              onClick={() => {
                playSfx('tap')
                onBack()
              }}
            >
              Back to map
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}
