import { Rainbow } from '../components/Rainbow'
import { EXPLORER_NAME } from '../content/explorer'

type Props = {
  onLab: () => void
  onWords: () => void
  onJumbled: () => void
}

export function Welcome({ onLab, onWords, onJumbled }: Props) {
  return (
    <main className="screen welcome hub">
      <Rainbow size="small" />
      <p className="eyebrow">{EXPLORER_NAME}&apos;s games</p>
      <h1 className="display">Welcome {EXPLORER_NAME}!</h1>
      <p className="subtitle">Pick a game</p>
      <div className="hub-cards">
        <button type="button" className="hub-card lab" onClick={onLab}>
          <span className="hub-icon" aria-hidden="true">
            🖥️
          </span>
          <span>
            <span className="hub-title">Parts of the computer</span>
            <span className="hub-blurb">Find the parts!</span>
          </span>
        </button>
        <button type="button" className="hub-card words" onClick={onWords}>
          <span className="hub-icon" aria-hidden="true">
            🌈
          </span>
          <span>
            <span className="hub-title">Fun with Words</span>
            <span className="hub-blurb">Type fun words!</span>
          </span>
        </button>
        <button type="button" className="hub-card jumbled" onClick={onJumbled}>
          <span className="hub-icon" aria-hidden="true">
            🔤
          </span>
          <span>
            <span className="hub-title">Jumbled Words</span>
            <span className="hub-blurb">Unscramble the letters!</span>
          </span>
        </button>
      </div>
    </main>
  )
}
