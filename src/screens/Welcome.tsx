import { useEffect, useState } from 'react'
import { Rainbow } from '../components/Rainbow'
import { SoundToggle } from '../components/SoundToggle'
import { EXPLORER_NAME } from '../content/explorer'
import { isMuted, playSfx, startBgm, unlockAudio } from '../audio/sounds'

type Props = {
  onLab: () => void
  onWords: () => void
  onJumbled: () => void
  onCountries: () => void
}

export function Welcome({ onLab, onWords, onJumbled, onCountries }: Props) {
  const [musicReady, setMusicReady] = useState(false)

  useEffect(() => {
    const kickoff = () => {
      void unlockAudio().then(() => {
        if (!isMuted()) void startBgm()
        setMusicReady(true)
      })
      window.removeEventListener('pointerdown', kickoff)
      window.removeEventListener('keydown', kickoff)
    }
    window.addEventListener('pointerdown', kickoff)
    window.addEventListener('keydown', kickoff)
    return () => {
      window.removeEventListener('pointerdown', kickoff)
      window.removeEventListener('keydown', kickoff)
    }
  }, [])

  function pick(next: () => void) {
    playSfx('whoosh')
    next()
  }

  return (
    <main className="screen welcome hub">
      <SoundToggle active />
      <Rainbow size="small" />
      <p className="eyebrow">{EXPLORER_NAME}&apos;s games</p>
      <h1 className="display">Welcome {EXPLORER_NAME}!</h1>
      <p className="subtitle">Pick a game</p>
      {!musicReady && !isMuted() ? (
        <p className="music-hint" role="status">
          Tap anywhere for music 🎵
        </p>
      ) : null}
      <div className="hub-cards">
        <button
          type="button"
          className="hub-card lab"
          onClick={() => pick(onLab)}
        >
          <span className="hub-icon" aria-hidden="true">
            🖥️
          </span>
          <span>
            <span className="hub-title">Parts of the computer</span>
            <span className="hub-blurb">Find the parts!</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card words"
          onClick={() => pick(onWords)}
        >
          <span className="hub-icon" aria-hidden="true">
            🌈
          </span>
          <span>
            <span className="hub-title">Fun with Words</span>
            <span className="hub-blurb">Type fun words!</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card jumbled"
          onClick={() => pick(onJumbled)}
        >
          <span className="hub-icon" aria-hidden="true">
            🔤
          </span>
          <span>
            <span className="hub-title">Jumbled Words</span>
            <span className="hub-blurb">Unscramble the letters!</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card countries"
          onClick={() => pick(onCountries)}
        >
          <span className="hub-icon" aria-hidden="true">
            🌍
          </span>
          <span>
            <span className="hub-title">Know the Countries</span>
            <span className="hub-blurb">Flags and maps!</span>
          </span>
        </button>
      </div>
    </main>
  )
}
