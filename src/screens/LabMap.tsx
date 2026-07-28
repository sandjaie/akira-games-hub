import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { LabScene } from '../content/LabScene'
import { LAB_ORDER, STATIONS } from '../content/stations'
import { getLabStatus, isLaptopUnlocked } from '../progress/progress'
import type { LabProgress, LabStationId } from '../types'

type Props = {
  name: string
  progress: LabProgress
  onHub: () => void
  onOpenStation: (id: LabStationId) => void
  onOpenLaptop: () => void
}

export function LabMap({
  name,
  progress,
  onHub,
  onOpenStation,
  onOpenLaptop,
}: Props) {
  const laptopOpen = isLaptopUnlocked(progress)
  const laptopDone = progress.completed.includes('laptop')

  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen map">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onHub}>
          ← Games
        </button>
        <span className="words-top-spacer" />
      </div>
      <h1 className="display">{name}&apos;s lab map</h1>
      <p>Pick a glowing part, {name}.</p>
      <div className="lab-stage" aria-label="School lab computer">
        <LabScene />
        {LAB_ORDER.map((id) => {
          const status = getLabStatus(progress, id)
          return (
            <button
              key={id}
              type="button"
              className={`hotspot hotspot-${id} status-${status}`}
              disabled={status === 'locked'}
              onClick={() => {
                playSfx('tap')
                onOpenStation(id)
              }}
            >
              {STATIONS[id].mapLabel}
              {status === 'done' ? <span className="star">★</span> : null}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="laptop-bonus"
        disabled={!laptopOpen}
        onClick={() => {
          playSfx('tap')
          onOpenLaptop()
        }}
      >
        {laptopDone ? '★ ' : ''}
        Laptop peek
      </button>
    </main>
  )
}
