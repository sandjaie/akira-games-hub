import { useEffect, useState } from 'react'
import {
  isMuted,
  setMuted,
  startBgm,
  stopBgm,
  unlockAudio,
} from '../audio/sounds'

type Props = {
  /** When true, keep BGM running (welcome). When false, stop it. */
  active: boolean
}

/** Floating mute / music control used on the hub and game screens. */
export function SoundToggle({ active }: Props) {
  const [muted, setMutedState] = useState(() => isMuted())

  useEffect(() => {
    if (!active) {
      stopBgm()
      return
    }
    if (!muted) {
      void startBgm()
    }
    return () => {
      stopBgm()
    }
  }, [active, muted])

  return (
    <button
      type="button"
      className={`sound-toggle${muted ? ' muted' : ''}`}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      onClick={() => {
        void unlockAudio()
        const next = !muted
        setMuted(next)
        setMutedState(next)
        if (!next && active) void startBgm()
        else stopBgm()
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
