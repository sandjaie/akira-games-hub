import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'

type Props = {
  name: string
  onReplay: () => void
  onMap: () => void
  onHub: () => void
}

export function Celebration({ name, onReplay, onMap, onHub }: Props) {
  useEffect(() => {
    stopBgm()
    playSfx('cheer')
  }, [])

  return (
    <main className="screen celebration">
      <SoundToggle active={false} />
      <h1 className="display cheer">You did it, {name}!</h1>
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
