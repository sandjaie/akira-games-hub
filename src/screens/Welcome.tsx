import { useEffect, useState } from 'react'
import { Rainbow } from '../components/Rainbow'
import { SoundToggle } from '../components/SoundToggle'
import {
  cleanPlayerName,
  MAKER_NAME,
  NAME_MAX_LENGTH,
} from '../content/explorer'
import { isMuted, playSfx, startBgm, unlockAudio } from '../audio/sounds'

type Props = {
  name: string
  onName: (name: string) => void
  onLab: () => void
  onWords: () => void
  onJumbled: () => void
  onCountries: () => void
  onSpace: () => void
  onTamizh: () => void
}

function MakerNote() {
  return (
    <section className="maker-note">
      <p>
        <strong>Hi! I&apos;m {MAKER_NAME}.</strong> I&apos;m 6 years old.
      </p>
      <p>I made these games with my dad, for every kid who loves a quiz.</p>
      <p>Have fun! 🌈</p>
    </section>
  )
}

export function Welcome({
  name,
  onName,
  onLab,
  onWords,
  onJumbled,
  onCountries,
  onSpace,
  onTamizh,
}: Props) {
  const [draft, setDraft] = useState(name)

  // Music plays on the hub by default. Browsers block audio before the first
  // gesture, so try right away and retry on the first tap/key if that failed.
  useEffect(() => {
    let done = false
    const play = () => {
      if (done || isMuted()) return
      startBgm().then(
        () => {
          done = true
        },
        () => {
          // autoplay blocked until a gesture — the listeners below retry
        },
      )
    }
    play()
    const retry = () => {
      unlockAudio().then(play, play)
    }
    window.addEventListener('pointerdown', retry)
    window.addEventListener('keydown', retry)
    return () => {
      window.removeEventListener('pointerdown', retry)
      window.removeEventListener('keydown', retry)
    }
  }, [])

  function pick(next: () => void) {
    playSfx('whoosh')
    next()
  }

  if (!name) {
    return (
      <main className="screen welcome hub">
        <SoundToggle active />
        <Rainbow size="small" />
        <p className="eyebrow">{MAKER_NAME}&apos;s games</p>
        <h1 className="display">Hey kid, what&apos;s your name?</h1>
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault()
            const clean = cleanPlayerName(draft)
            if (!clean) return
            playSfx('cheer')
            onName(clean)
          }}
        >
          <input
            className="name-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            spellCheck={false}
            aria-label="Your name"
            placeholder="Type your name"
          />
          <button type="submit" disabled={!cleanPlayerName(draft)}>
            Let&apos;s play →
          </button>
        </form>
        <MakerNote />
      </main>
    )
  }

  return (
    <main className="screen welcome hub">
      <SoundToggle active />
      <Rainbow size="small" />
      <p className="eyebrow">{MAKER_NAME}&apos;s games</p>
      <h1 className="display">Welcome {name}!</h1>
      <p className="subtitle">Pick a game</p>
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
            <span className="hub-blurb">Keyboard typing practice</span>
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
        <button
          type="button"
          className="hub-card space"
          onClick={() => pick(onSpace)}
        >
          <span className="hub-icon" aria-hidden="true">
            🚀
          </span>
          <span>
            <span className="hub-title">Space Explorer</span>
            <span className="hub-blurb">Learn space facts, then quiz!</span>
          </span>
        </button>
        <button
          type="button"
          className="hub-card tamizh"
          onClick={() => pick(onTamizh)}
        >
          <span className="hub-icon" aria-hidden="true">
            📜
          </span>
          <span>
            <span className="hub-title">Tamizh · தமிழ்</span>
            <span className="hub-blurb">Thirukkural for kids</span>
          </span>
        </button>
      </div>
      <button
        type="button"
        className="secondary name-change"
        onClick={() => {
          playSfx('tap')
          setDraft('')
          onName('')
        }}
      >
        Not {name}? Change name
      </button>
      <MakerNote />
    </main>
  )
}
