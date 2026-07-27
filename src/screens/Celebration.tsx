type Props = { onReplay: () => void; onMap: () => void }

export function Celebration({ onReplay, onMap }: Props) {
  return (
    <main className="screen celebration">
      <h1 className="display cheer">You did it!</h1>
      <p>You found the lab computer parts.</p>
      <p>And you peeked inside a laptop too!</p>
      <div className="actions">
        <button type="button" onClick={onMap}>
          Back to map
        </button>
        <button type="button" className="secondary" onClick={onReplay}>
          Play again
        </button>
      </div>
    </main>
  )
}
