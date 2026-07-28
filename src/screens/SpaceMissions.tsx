import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { MISSIONS, MISSION_ORDER, type MissionId } from '../content/space'
import type { SpaceProgress } from '../types'

type Props = {
  mode: 'learn' | 'quiz'
  space: SpaceProgress
  onBack: () => void
  onPick: (id: MissionId) => void
}

export function SpaceMissions({ mode, space, onBack, onPick }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen space-missions">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Back
        </button>
        <p className="eyebrow">{mode === 'learn' ? 'Learn 🔭' : 'Quiz 🚀'}</p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <h1 className="display">Choose a mission</h1>
      <p className="subtitle">
        {mode === 'learn'
          ? 'A few fact cards each — read them in any order'
          : 'Questions about what each mission teaches'}
      </p>

      <div className="mission-list">
        {MISSION_ORDER.map((id) => {
          const mission = MISSIONS[id]
          const stars = space.bestStars[id]
          const learned = space.learnedMissionIds.includes(id)
          return (
            <button
              key={id}
              type="button"
              className="mission-card"
              onClick={() => {
                playSfx('tap')
                onPick(id)
              }}
            >
              <span className="mission-emoji" aria-hidden="true">
                {mission.emoji}
              </span>
              <span className="mission-text">
                <span className="mission-title">{mission.title}</span>
                <span className="mission-blurb">{mission.blurb}</span>
              </span>
              <span className="mission-badge">
                {mode === 'quiz' && stars ? (
                  <span aria-label={`${stars} stars`}>{'★'.repeat(stars)}</span>
                ) : mode === 'learn' && learned ? (
                  <span aria-label="read">✓</span>
                ) : (
                  <span aria-hidden="true">›</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
