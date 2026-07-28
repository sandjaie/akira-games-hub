import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getMission, type MissionId } from '../content/space'
import { SpaceArt } from '../content/space/SpaceArt'
import type { SpaceStars } from '../space/quiz'

type Props = {
  missionId: MissionId
  score: number
  asked: number
  stars: SpaceStars
  onReplay: () => void
  onLearn: () => void
  onMissions: () => void
  onHub: () => void
}

export function SpaceResults({
  missionId,
  score,
  asked,
  stars,
  onReplay,
  onLearn,
  onMissions,
  onHub,
}: Props) {
  const mission = getMission(missionId)

  useEffect(() => {
    stopBgm()
    playSfx('cheer')
  }, [])

  return (
    <main className="screen space-results">
      <SoundToggle active={false} />
      <SpaceArt kind="rocket" className="results-art" />
      <h1 className="display cheer">Mission complete!</h1>
      <p className="subtitle">
        {mission.emoji} {mission.title}
      </p>
      <p
        className="countries-final-score"
        aria-label={`Score ${score} out of ${asked}`}
      >
        {score} / {asked} correct
      </p>
      <p className="jumbled-stars" aria-label={`${stars} stars`}>
        {'★'.repeat(stars)}
        <span className="jumbled-stars-empty" aria-hidden="true">
          {'☆'.repeat(3 - stars)}
        </span>
      </p>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            onReplay()
          }}
        >
          Play again
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onLearn()
          }}
        >
          Read the cards
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onMissions()
          }}
        >
          Missions
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onHub()
          }}
        >
          Games
        </button>
      </div>
    </main>
  )
}
