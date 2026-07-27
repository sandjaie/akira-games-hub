import { EXPLORER_NAME } from '../content/explorer'

type Props = { onReplay: () => void; onMap: () => void; onHub: () => void }

export function Celebration({ onReplay, onMap, onHub }: Props) {
  return (
    <main className="screen celebration">
      <h1 className="display cheer">You did it, {EXPLORER_NAME}!</h1>
      <p>You found the lab computer parts.</p>
      <p>And you peeked inside a laptop too!</p>
      <div className="actions">
        <button type="button" onClick={onHub}>
          Games
        </button>
        <button type="button" className="secondary" onClick={onMap}>
          Back to map
        </button>
        <button type="button" className="secondary" onClick={onReplay}>
          Play again
        </button>
      </div>
    </main>
  )
}
