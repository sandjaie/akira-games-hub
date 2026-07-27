import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { EXPLORER_NAME } from '../content/explorer'

type Props = { onReplay: () => void; onMap: () => void; onHub: () => void }

export function Celebration({ onReplay, onMap, onHub }: Props) {
  useEffect(() => {
    stopBgm()
    playSfx('cheer')
  }, [])

  return (
    <main className="screen celebration">
      <SoundToggle active={false} />
      <h1 className="display cheer">You did it, {EXPLORER_NAME}!</h1>
      <p>You found the lab computer parts.</p>
      <p>And you peeked inside a laptop too!</p>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            onHub()
          }}
        >
          Games
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onMap()
          }}
        >
          Back to map
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onReplay()
          }}
        >
          Play again
        </button>
      </div>
    </main>
  )
}
