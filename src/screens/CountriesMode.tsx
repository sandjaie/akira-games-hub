import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import type { CountriesMode } from '../countries/quiz'

type Props = {
  onBack: () => void
  onPick: (mode: CountriesMode) => void
}

export function CountriesMode({ onBack, onPick }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen countries-mode">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onBack()
          }}
        >
          ← Games
        </button>
        <p className="eyebrow">Know the Countries</p>
        <span className="words-top-spacer" />
      </div>
      <h1 className="display">Pick a mode</h1>
      <p className="subtitle">Flags or maps — you choose!</p>
      <div className="hub-cards countries-mode-cards">
        <button
          type="button"
          className="hub-card countries-flags"
          onClick={() => {
            playSfx('whoosh')
            onPick('flags')
          }}
          aria-label="Flags. Look at a flag and pick the country name."
        >
          <span className="hub-icon" aria-hidden="true">
            🏁
          </span>
          <span>
            <span className="hub-title">Flags</span>
            <span className="hub-blurb">Match the flag!</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card countries-maps"
          onClick={() => {
            playSfx('whoosh')
            onPick('maps')
          }}
          aria-label="Maps. Find countries on a simple map."
        >
          <span className="hub-icon" aria-hidden="true">
            🗺️
          </span>
          <span>
            <span className="hub-title">Maps</span>
            <span className="hub-blurb">Find it on the map!</span>
          </span>
        </button>
      </div>
    </main>
  )
}
