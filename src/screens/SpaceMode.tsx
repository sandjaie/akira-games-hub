import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { SpaceArt } from '../content/space/SpaceArt'

type Props = {
  onBack: () => void
  onPick: (mode: 'learn' | 'quiz') => void
}

export function SpaceMode({ onBack, onPick }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen space-mode">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Games
        </button>
        <p className="eyebrow">Space Explorer</p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <h1 className="display">What shall we do?</h1>
      <p className="subtitle">Learn about space, then test yourself</p>

      <div className="hub-cards">
        <button
          type="button"
          className="hub-card space-learn-card"
          onClick={() => {
            playSfx('whoosh')
            onPick('learn')
          }}
        >
          <SpaceArt kind="telescope" className="hub-art" />
          <span>
            <span className="hub-title">Learn 🔭</span>
            <span className="hub-blurb">Fact cards for each mission</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card space-quiz-card"
          onClick={() => {
            playSfx('whoosh')
            onPick('quiz')
          }}
        >
          <SpaceArt kind="rocket" className="hub-art" />
          <span>
            <span className="hub-title">Quiz 🚀</span>
            <span className="hub-blurb">Pick the right picture</span>
          </span>
        </button>
      </div>
    </main>
  )
}
