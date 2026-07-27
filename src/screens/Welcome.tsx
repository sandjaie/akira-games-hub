type Props = { onStart: () => void }

export function Welcome({ onStart }: Props) {
  return (
    <main className="screen welcome">
      <p className="eyebrow">School computer lab</p>
      <h1 className="display">Computer Lab Adventure</h1>
      <div className="hero-pc" aria-hidden="true">
        <div className="hero-monitor" />
        <div className="hero-stand" />
        <div className="hero-base" />
        <div className="hero-tower" />
      </div>
      <p>You are the explorer!</p>
      <p>Find the parts of the computer.</p>
      <div className="actions">
        <button type="button" onClick={onStart}>
          Let&apos;s go!
        </button>
      </div>
    </main>
  )
}
