/**
 * Lightweight Web Audio SFX + welcome BGM (no asset files).
 * iOS requires a user gesture before sound; call unlockAudio() on first tap.
 */

const MUTE_KEY = 'akira-sound-muted'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bgmNodes: OscillatorNode[] = []
let bgmGain: GainNode | null = null
let bgmTimer: number | null = null
let bgmPlaying = false

function getCtx(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = isMuted() ? 0 : 0.7
    master.connect(ctx.destination)
  }
  return ctx
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore
  }
  if (master) master.gain.value = muted ? 0 : 0.7
  if (muted) stopBgm()
}

export async function unlockAudio(): Promise<void> {
  const audio = getCtx()
  if (audio.state === 'suspended') await audio.resume()
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
): void {
  const audio = getCtx()
  if (!master || isMuted()) return
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

export type SfxKind =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'word'
  | 'cheer'
  | 'hint'
  | 'whoosh'

export function playSfx(kind: SfxKind): void {
  if (isMuted()) return
  void unlockAudio()
  const audio = getCtx()
  const t = audio.currentTime

  switch (kind) {
    case 'tap':
      tone(520, t, 0.06, 'triangle', 0.06)
      break
    case 'correct':
      tone(523.25, t, 0.1, 'sine', 0.1)
      tone(659.25, t + 0.07, 0.12, 'sine', 0.09)
      break
    case 'wrong':
      tone(220, t, 0.14, 'triangle', 0.07)
      tone(180, t + 0.05, 0.12, 'triangle', 0.05)
      break
    case 'word':
      tone(392, t, 0.1, 'sine', 0.1)
      tone(523.25, t + 0.08, 0.1, 'sine', 0.1)
      tone(659.25, t + 0.16, 0.14, 'sine', 0.11)
      break
    case 'cheer':
      ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, t + i * 0.09, 0.2, 'sine', 0.1)
      })
      break
    case 'hint':
      tone(740, t, 0.08, 'sine', 0.07)
      tone(880, t + 0.08, 0.1, 'sine', 0.06)
      break
    case 'whoosh':
      tone(300, t, 0.15, 'sine', 0.05)
      tone(420, t + 0.05, 0.12, 'triangle', 0.04)
      break
  }
}

const BGM_NOTES = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]

function scheduleBgmLoop(): void {
  if (!bgmPlaying || isMuted()) return
  const audio = getCtx()
  if (!master) return

  if (!bgmGain) {
    bgmGain = audio.createGain()
    bgmGain.gain.value = 0.045
    bgmGain.connect(master)
  }

  const start = audio.currentTime + 0.02
  const step = 0.42
  bgmNodes = []

  BGM_NOTES.forEach((freq, i) => {
    const osc = audio.createOscillator()
    const g = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const when = start + i * step
    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(0.09, when + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, when + step * 0.9)
    osc.connect(g)
    g.connect(bgmGain!)
    osc.start(when)
    osc.stop(when + step)
    bgmNodes.push(osc)
  })

  // soft drone under the melody
  const drone = audio.createOscillator()
  const dg = audio.createGain()
  drone.type = 'sine'
  drone.frequency.value = 130.81
  dg.gain.value = 0.025
  drone.connect(dg)
  dg.connect(bgmGain)
  drone.start(start)
  drone.stop(start + BGM_NOTES.length * step)
  bgmNodes.push(drone)

  const loopMs = BGM_NOTES.length * step * 1000
  bgmTimer = window.setTimeout(() => {
    if (bgmPlaying) scheduleBgmLoop()
  }, loopMs)
}

export async function startBgm(): Promise<void> {
  if (isMuted()) return
  await unlockAudio()
  if (bgmPlaying) return
  bgmPlaying = true
  scheduleBgmLoop()
}

export function stopBgm(): void {
  bgmPlaying = false
  if (bgmTimer !== null) {
    window.clearTimeout(bgmTimer)
    bgmTimer = null
  }
  for (const n of bgmNodes) {
    try {
      n.stop()
    } catch {
      // already stopped
    }
  }
  bgmNodes = []
}

export function isBgmPlaying(): boolean {
  return bgmPlaying
}
