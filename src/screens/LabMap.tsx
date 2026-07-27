import { LAB_ORDER, STATIONS } from '../content/stations'
import { getLabStatus, isLaptopUnlocked } from '../progress/progress'
import type { LabStationId, Progress } from '../types'

type Props = {
  progress: Progress
  onOpenStation: (id: LabStationId) => void
  onOpenLaptop: () => void
}

export function LabMap({ progress, onOpenStation, onOpenLaptop }: Props) {
  const laptopOpen = isLaptopUnlocked(progress)
  const laptopDone = progress.completed.includes('laptop')

  return (
    <main className="screen map">
      <h1 className="display">Lab map</h1>
      <p>Pick a glowing part.</p>
      <div className="lab-stage" aria-label="School lab computer">
        <div className="pc-art" aria-hidden="true">
          <div className="pc-monitor" />
          <div className="pc-tower" />
          <div className="pc-keyboard" />
          <div className="pc-mouse" />
        </div>
        {LAB_ORDER.map((id) => {
          const status = getLabStatus(progress, id)
          return (
            <button
              key={id}
              type="button"
              className={`hotspot hotspot-${id} status-${status}`}
              disabled={status === 'locked'}
              onClick={() => onOpenStation(id)}
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
        onClick={onOpenLaptop}
      >
        {laptopDone ? '★ ' : ''}
        Laptop peek
      </button>
    </main>
  )
}
