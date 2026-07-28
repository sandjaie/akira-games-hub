import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'

type Props = {
  onBack: () => void
  onThirukkural: () => void
}

export function TamizhHome({ onBack, onThirukkural }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen tamizh-home">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Games
        </button>
        <p className="eyebrow">தமிழ் · Tamizh</p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <h1 className="display">Tamizh time!</h1>
      <p className="subtitle">Pick something to learn</p>

      <div className="hub-cards">
        <button
          type="button"
          className="hub-card tamizh-thirukkural-card"
          onClick={() => {
            playSfx('whoosh')
            onThirukkural()
          }}
        >
          <span className="hub-icon" aria-hidden="true">
            📜
          </span>
          <span>
            <span className="hub-title">திருக்குறள்</span>
            <span className="hub-blurb">Thirukkural — 1330 wise couplets</span>
          </span>
        </button>
      </div>
    </main>
  )
}
