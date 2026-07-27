# Computer Lab Adventure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React kid-friendly story website where a 6-year-old explores school-lab PC parts via short scenes and mini-games, then a laptop bonus, playable on laptop and iPad over home Wi‑Fi.

**Architecture:** Single-page React app with in-app screen state (`welcome` | `map` | `station` | `laptop` | `celebration`). Station content lives in one module; progress in `localStorage`. Each mini-game is a small component that calls `onComplete()` on success. Static build; parent serves with Vite `--host`.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, React Testing Library, CSS modules / global CSS variables (no UI kit).

## Global Constraints

- Audience: 6-year-old; pictures-first; short readable sentences; no voice narration in v1
- Child is the explorer; no robot sidekick
- Devices: iPad + laptop; big tap targets (~44px+); pointer events for drag
- Unlock order: monitor → keyboard → mouse → cpu → memory → storage → power → speakers → wifi → laptop bonus
- Progress key: `cla-progress` in `localStorage`
- No accounts, analytics, or external APIs
- Visual: bright school-lab look; expressive fonts (not Inter/Roboto/Arial/system); avoid purple-gradient AI look and cream+terracotta cliché
- Gentle failure only; back to map always; save progress only on success
- Home play: `npm run play` → `vite --host` documented in README

---

## File structure

```
computer-lab-adventure/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  index.html
  README.md
  src/
    main.tsx
    App.tsx
    App.css
    index.css
    vite-env.d.ts
    types.ts
    content/
      stations.ts
    progress/
      progress.ts
      progress.test.ts
    screens/
      Welcome.tsx
      LabMap.tsx
      StationScene.tsx
      LaptopBonus.tsx
      Celebration.tsx
    games/
      types.ts
      MonitorGame.tsx
      KeyboardGame.tsx
      MouseGame.tsx
      CpuGame.tsx
      MemoryGame.tsx
      StorageGame.tsx
      PowerGame.tsx
      SpeakersGame.tsx
      WifiGame.tsx
      gameRegistry.ts
  public/
    favicon.svg
```

---

### Task 1: Scaffold Vite React TS + theme + play script

**Files:**
- Create: project via `npm create vite@latest . -- --template react-ts` (in repo root; keep existing `docs/`)
- Create: `src/index.css`, `README.md`, `public/favicon.svg`
- Modify: `package.json` (add `play` script + vitest deps), `vite.config.ts` (vitest), `index.html` (fonts + title)

**Interfaces:**
- Consumes: none
- Produces: runnable Vite app; `npm run play` → `vite --host`; `npm test` → vitest

- [ ] **Step 1: Scaffold Vite in the repo root without wiping docs**

```bash
cd /Users/sandjaieravi/computer-lab-adventure
npm create vite@latest . -- --template react-ts
# If the tool refuses non-empty dir, scaffold in /tmp/cla-vite and copy package.json, vite.config.ts, tsconfig*.json, index.html, src/ into the repo (do not delete docs/)
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Configure Vitest in `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "play": "vite --host",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Theme + fonts in `index.html` and `src/index.css`**

`index.html` head: title `Computer Lab Adventure`, Google fonts link for **Nunito** (body) and **Fredoka** (display).

Replace `src/index.css` with:

```css
:root {
  --ink: #1c2a3a;
  --paper: #f7f3e8;
  --sky: #7ec8e3;
  --sky-deep: #3a8fb7;
  --desk: #c4a574;
  --desk-dark: #8b6914;
  --leaf: #5f9e6e;
  --sun: #f0c43a;
  --coral: #e86f5c;
  --tower: #5a6b7d;
  --white: #fffdf8;
  --locked: #9aa6b2;
  --tap-min: 48px;
  --radius: 20px;
  --shadow: 0 8px 24px rgba(28, 42, 58, 0.12);
  font-family: Nunito, system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
  line-height: 1.35;
}

* { box-sizing: border-box; }

html, body, #root {
  margin: 0;
  min-height: 100%;
}

body {
  background:
    radial-gradient(ellipse 120% 80% at 10% -10%, #bfe6f5 0%, transparent 55%),
    radial-gradient(ellipse 90% 70% at 100% 0%, #ffe9a8 0%, transparent 50%),
    linear-gradient(180deg, #eaf6fb 0%, var(--paper) 55%, #efe6d4 100%);
}

h1, h2, .display {
  font-family: Fredoka, Nunito, sans-serif;
  font-weight: 600;
}

button {
  font: inherit;
  cursor: pointer;
  min-height: var(--tap-min);
  min-width: var(--tap-min);
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  background: var(--sky-deep);
  color: white;
  box-shadow: var(--shadow);
}

button:disabled {
  background: var(--locked);
  cursor: not-allowed;
}

@keyframes star-pop {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes scene-enter {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes cheer {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
```

- [ ] **Step 4: Smoke-run and commit**

```bash
npm run build
npm test  # may pass with zero tests
```

Expected: build succeeds.

```bash
git add -A
git commit -m "chore: scaffold Vite React app with theme and play script"
```

---

### Task 2: Types, station content, progress logic (TDD)

**Files:**
- Create: `src/types.ts`, `src/content/stations.ts`, `src/progress/progress.ts`, `src/progress/progress.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `LabStationId`, `StationId`, `Screen`, `Progress`, `StationDefinition`
  - `LAB_ORDER: LabStationId[]`
  - `STATIONS: Record<LabStationId, StationDefinition>`
  - `loadProgress(): Progress`
  - `saveProgress(progress: Progress): void`
  - `clearProgress(): void`
  - `completeStation(progress: Progress, id: StationId): Progress`
  - `getLabStatus(progress: Progress, id: LabStationId): 'locked' | 'available' | 'done'`
  - `isLabComplete(progress: Progress): boolean`
  - `isLaptopUnlocked(progress: Progress): boolean`

- [ ] **Step 1: Write failing tests in `src/progress/progress.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  LAB_ORDER,
  clearProgress,
  completeStation,
  getLabStatus,
  isLabComplete,
  isLaptopUnlocked,
  loadProgress,
  saveProgress,
} from './progress'

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear()
    clearProgress()
  })

  it('starts with only monitor available', () => {
    const p = loadProgress()
    expect(getLabStatus(p, 'monitor')).toBe('available')
    expect(getLabStatus(p, 'keyboard')).toBe('locked')
    expect(isLaptopUnlocked(p)).toBe(false)
  })

  it('unlocks the next station after complete', () => {
    let p = loadProgress()
    p = completeStation(p, 'monitor')
    saveProgress(p)
    p = loadProgress()
    expect(getLabStatus(p, 'monitor')).toBe('done')
    expect(getLabStatus(p, 'keyboard')).toBe('available')
  })

  it('unlocks laptop after all lab stations', () => {
    let p = loadProgress()
    for (const id of LAB_ORDER) {
      p = completeStation(p, id)
    }
    expect(isLabComplete(p)).toBe(true)
    expect(isLaptopUnlocked(p)).toBe(true)
    p = completeStation(p, 'laptop')
    expect(p.completed.includes('laptop')).toBe(true)
  })

  it('keeps finished stations replayable (still done)', () => {
    let p = completeStation(loadProgress(), 'monitor')
    expect(getLabStatus(p, 'monitor')).toBe('done')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL (module / exports missing).

- [ ] **Step 3: Implement types + content + progress**

`src/types.ts`:

```ts
export type LabStationId =
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'power'
  | 'speakers'
  | 'wifi'

export type StationId = LabStationId | 'laptop'

export type Screen =
  | { name: 'welcome' }
  | { name: 'map' }
  | { name: 'station'; stationId: LabStationId }
  | { name: 'laptop' }
  | { name: 'celebration' }

export type Progress = {
  completed: StationId[]
}

export type GameKind =
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'power'
  | 'speakers'
  | 'wifi'

export type StationDefinition = {
  id: LabStationId
  kidName: string
  grownUpWord?: string
  blurb: [string, string]
  game: GameKind
  mapLabel: string
}
```

`src/content/stations.ts` — export `LAB_ORDER` and `STATIONS` with kid copy matching the spec (Screen, Keyboard, Mouse, Brain, Memory, Storage box, Power, Speakers, Wifi). Example entries:

```ts
import type { LabStationId, StationDefinition } from '../types'

export const LAB_ORDER: LabStationId[] = [
  'monitor', 'keyboard', 'mouse', 'cpu', 'memory', 'storage', 'power', 'speakers', 'wifi',
]

export const STATIONS: Record<LabStationId, StationDefinition> = {
  monitor: {
    id: 'monitor',
    kidName: 'Screen',
    grownUpWord: 'Monitor',
    mapLabel: 'Screen',
    blurb: [
      'This is the Screen. It shows pictures and words.',
      'Tap what you see on the Screen!',
    ],
    game: 'monitor',
  },
  // ... all nine stations with 2 short sentences each
}
```

Fill all nine with similar short copy. Keyboard blurb mentions typing letters; mouse mentions pointing; cpu = Brain / CPU; etc.

`src/progress/progress.ts`:

```ts
import { LAB_ORDER } from '../content/stations'
import type { LabStationId, Progress, StationId } from '../types'

const KEY = 'cla-progress'

export { LAB_ORDER }

export function emptyProgress(): Progress {
  return { completed: [] }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Progress
    if (!parsed || !Array.isArray(parsed.completed)) return emptyProgress()
    return { completed: parsed.completed }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function clearProgress(): void {
  localStorage.removeItem(KEY)
}

export function completeStation(progress: Progress, id: StationId): Progress {
  if (progress.completed.includes(id)) return progress
  return { completed: [...progress.completed, id] }
}

export function isLabComplete(progress: Progress): boolean {
  return LAB_ORDER.every((id) => progress.completed.includes(id))
}

export function isLaptopUnlocked(progress: Progress): boolean {
  return isLabComplete(progress)
}

export function getLabStatus(
  progress: Progress,
  id: LabStationId,
): 'locked' | 'available' | 'done' {
  if (progress.completed.includes(id)) return 'done'
  const index = LAB_ORDER.indexOf(id)
  if (index === 0) return 'available'
  const prev = LAB_ORDER[index - 1]
  if (progress.completed.includes(prev)) return 'available'
  return 'locked'
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: all progress tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/content/stations.ts src/progress/progress.ts src/progress/progress.test.ts
git commit -m "feat: add station content and progress unlock logic"
```

---

### Task 3: App shell + Welcome + Celebration + wiring

**Files:**
- Create: `src/screens/Welcome.tsx`, `src/screens/Celebration.tsx`, `src/App.css`
- Modify: `src/App.tsx`, `src/main.tsx`

**Interfaces:**
- Consumes: `Screen`, `Progress`, `loadProgress`, `saveProgress`, `clearProgress`
- Produces: `App` owns `screen` + `progress`; Welcome calls `onStart`; Celebration calls `onReplay` (clears progress → welcome) and `onMap`

- [ ] **Step 1: Implement Welcome**

```tsx
type Props = { onStart: () => void }

export function Welcome({ onStart }: Props) {
  return (
    <main className="screen welcome">
      <p className="eyebrow">School computer lab</p>
      <h1 className="display">Computer Lab Adventure</h1>
      <p>You are the explorer!</p>
      <p>Find the parts of the computer.</p>
      <button type="button" onClick={onStart}>Let&apos;s go!</button>
    </main>
  )
}
```

- [ ] **Step 2: Implement Celebration**

```tsx
type Props = { onReplay: () => void; onMap: () => void }

export function Celebration({ onReplay, onMap }: Props) {
  return (
    <main className="screen celebration">
      <h1 className="display cheer">You did it!</h1>
      <p>You found the lab computer parts.</p>
      <p>And you peeked inside a laptop too!</p>
      <button type="button" onClick={onMap}>Back to map</button>
      <button type="button" className="secondary" onClick={onReplay}>Play again</button>
    </main>
  )
}
```

- [ ] **Step 3: Wire `App.tsx` screen state**

```tsx
import { useEffect, useState } from 'react'
import type { Progress, Screen } from './types'
import { clearProgress, loadProgress, saveProgress } from './progress/progress'
import { Welcome } from './screens/Welcome'
import { Celebration } from './screens/Celebration'
// LabMap, StationScene, LaptopBonus added in later tasks — stub placeholders OK temporarily

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'welcome' })

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  if (screen.name === 'welcome') {
    return <Welcome onStart={() => setScreen({ name: 'map' })} />
  }
  if (screen.name === 'celebration') {
    return (
      <Celebration
        onMap={() => setScreen({ name: 'map' })}
        onReplay={() => {
          clearProgress()
          setProgress({ completed: [] })
          setScreen({ name: 'welcome' })
        }}
      />
    )
  }
  // temporary fallback until map exists:
  return (
    <main className="screen">
      <p>Map coming next</p>
      <button type="button" onClick={() => setScreen({ name: 'welcome' })}>Back</button>
    </main>
  )
}
```

Style `.screen` in `App.css` with `animation: scene-enter 0.35s ease`, max-width, padding, centered.

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

Expected: Welcome → Let’s go → placeholder map; Celebration reachable later.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.css src/screens/Welcome.tsx src/screens/Celebration.tsx src/main.tsx src/index.css
git commit -m "feat: add welcome and celebration screens"
```

---

### Task 4: Lab map

**Files:**
- Create: `src/screens/LabMap.tsx`
- Modify: `src/App.tsx`, `src/App.css`

**Interfaces:**
- Consumes: `progress`, `getLabStatus`, `isLaptopUnlocked`, `STATIONS`, `LAB_ORDER`
- Produces: `LabMap` props:
  - `progress: Progress`
  - `onOpenStation: (id: LabStationId) => void`
  - `onOpenLaptop: () => void`

- [ ] **Step 1: Build LabMap UI**

Friendly lab desk composition (CSS shapes): monitor, tower, keyboard, mouse as clickable hotspots. Each lab station button:

- `locked` → disabled, muted
- `available` → bright, pulse-friendly
- `done` → shows ★ with `animation: star-pop`

Also a **Laptop** button enabled only when `isLaptopUnlocked(progress)`; if laptop completed, show star and still allow replay.

```tsx
import { LAB_ORDER, STATIONS } from '../content/stations'
import { getLabStatus, isLaptopUnlocked } from '../progress/progress'
import type { LabStationId, Progress } from '../types'

type Props = {
  progress: Progress
  onOpenStation: (id: LabStationId) => void
  onOpenLaptop: () => void
}

export function LabMap({ progress, onOpenStation, onOpenLaptop }: Props) {
  const laptopOpen = isLaptopUnlocked(progress)
  const laptopDone = progress.completed.includes('laptop')

  return (
    <main className="screen map">
      <h1 className="display">Lab map</h1>
      <p>Pick a glowing part.</p>
      <div className="lab-stage" aria-label="School lab computer">
        {/* CSS-drawn PC; station buttons positioned on/near parts */}
        {LAB_ORDER.map((id) => {
          const status = getLabStatus(progress, id)
          return (
            <button
              key={id}
              type="button"
              className={`hotspot hotspot-${id} status-${status}`}
              disabled={status === 'locked'}
              onClick={() => onOpenStation(id)}
            >
              {STATIONS[id].mapLabel}
              {status === 'done' ? <span className="star">★</span> : null}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="laptop-bonus"
        disabled={!laptopOpen}
        onClick={onOpenLaptop}
      >
        {laptopDone ? '★ ' : ''}Laptop peek
      </button>
    </main>
  )
}
```

Lay out hotspots with CSS grid/absolute positions so the stage reads as one PC on a desk (not a dashboard of cards).

- [ ] **Step 2: Wire map into App**

Replace placeholder: `screen.name === 'map'` → `<LabMap ... />`.

- [ ] **Step 3: Manual check** — only Screen enabled at start; complete via temporary button later.

- [ ] **Step 4: Commit**

```bash
git add src/screens/LabMap.tsx src/App.tsx src/App.css
git commit -m "feat: add lab map with unlock states and stars"
```

---

### Task 5: StationScene + game registry stubs

**Files:**
- Create: `src/games/types.ts`, `src/games/gameRegistry.tsx`, stub game components under `src/games/*.tsx`
- Create: `src/screens/StationScene.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `STATIONS`, `completeStation`
- Produces:
  - `MiniGameProps = { onComplete: () => void }`
  - `gameRegistry: Record<GameKind, ComponentType<MiniGameProps>>`
  - `StationScene` props: `stationId`, `onBack`, `onCompletedStation: (id) => void`

- [ ] **Step 1: Game types + stubs**

`src/games/types.ts`:

```ts
export type MiniGameProps = { onComplete: () => void }
```

Each stub (example `MonitorGame.tsx`):

```tsx
import type { MiniGameProps } from './types'

export function MonitorGame({ onComplete }: MiniGameProps) {
  return (
    <div className="game">
      <p>Tap the cat on the Screen.</p>
      <button type="button" className="game-choice" onClick={onComplete}>🐱 Cat</button>
      <button type="button" className="game-choice">🚗 Car</button>
      <button type="button" className="game-choice">🌳 Tree</button>
    </div>
  )
}
```

Stubs for all nine must call `onComplete` on the correct action only (wrong answers do nothing harsh — optional short “Try again!” text).

`gameRegistry.tsx` maps each `GameKind` to its component.

- [ ] **Step 2: StationScene**

Phases: `story` → `play` → `reward`

```tsx
// props: stationId, onBack, onCompletedStation
// story: show blurb + "Play!" button
// play: render gameRegistry[station.game]
// onComplete → set reward; call onCompletedStation(stationId) once
// reward: "You found it!" + button Back to map
// Always show Back to map in header (does not complete)
```

- [ ] **Step 3: Wire App station screen**

```tsx
onCompletedStation={(id) => {
  setProgress((p) => completeStation(p, id))
}}
onBack={() => setScreen({ name: 'map' })}
```

- [ ] **Step 4: Manual path** — finish Screen stub → star on map → Keyboard unlocks.

- [ ] **Step 5: Commit**

```bash
git add src/games src/screens/StationScene.tsx src/App.tsx src/App.css
git commit -m "feat: add station scenes with stub mini-games"
```

---

### Task 6: Real mini-games (lab stations)

**Files:**
- Modify: each file in `src/games/*.tsx` (replace stubs with full interactions)

**Interfaces:**
- Consumes: `MiniGameProps`
- Produces: working games; still only `onComplete()` on success

Implement these behaviors (pointer-friendly, 48px targets):

| Game | Behavior |
|------|----------|
| `MonitorGame` | Three big picture buttons; only the named one completes (e.g. “Tap the sun”) |
| `KeyboardGame` | Show target word `CAT`; on-screen keys; tap letters in order; wrong letter gentle reset of current letter only |
| `MouseGame` | Draggable pointer circle; drop/hit a target pad using pointer events |
| `CpuGame` | 2×2 memory match of 2 pairs (4 cards); match both pairs to complete |
| `MemoryGame` | Light up 3 pads in order once; child repeats the sequence |
| `StorageGame` | Drag or tap two “files” into a box hotspot |
| `PowerGame` | Drag plug to socket OR tap “Flip switch” after plug seated |
| `SpeakersGame` | Three ordered buttons Quiet → Medium → Loud |
| `WifiGame` | Tap dots in order to draw a path (3 dots); complete when all connected |

- [ ] **Step 1: Implement games one file at a time; after each, click-test in browser**
- [ ] **Step 2: Commit**

```bash
git add src/games
git commit -m "feat: implement lab station mini-games"
```

---

### Task 7: Laptop bonus + celebration path

**Files:**
- Create: `src/screens/LaptopBonus.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `completeStation`, `isLaptopUnlocked`
- Produces: `LaptopBonus` props `{ onBack, onComplete: () => void }` where `onComplete` marks laptop done and navigates to celebration

- [ ] **Step 1: LaptopBonus match game**

Show 4 lab labels (Screen, Brain, Keyboard, Storage) and 4 laptop spots. Tap a label then a spot to match. All four correct → success.

Copy:

- “A laptop has the same friends inside!”
- “Match each part to its cozy spot.”

- [ ] **Step 2: Wire App**

```tsx
if (screen.name === 'laptop') {
  return (
    <LaptopBonus
      onBack={() => setScreen({ name: 'map' })}
      onComplete={() => {
        setProgress((p) => completeStation(p, 'laptop'))
        setScreen({ name: 'celebration' })
      }}
    />
  )
}
```

If user opens laptop when already completed, still allow replay; onComplete can no-op duplicate then go celebration or stay — prefer: completing again still shows celebration.

- [ ] **Step 3: Manual full path** — all stations → laptop → celebration → play again clears progress.

- [ ] **Step 4: Commit**

```bash
git add src/screens/LaptopBonus.tsx src/App.tsx
git commit -m "feat: add laptop bonus and path to celebration"
```

---

### Task 8: Polish, README, iPad play verification

**Files:**
- Modify: `README.md`, `src/App.css`, `src/index.css`, any tight tap targets
- Create: none required

**Interfaces:**
- Produces: parent-facing play instructions; motion polish

- [ ] **Step 1: README**

```markdown
# Computer Lab Adventure

A story + mini-game site for kids exploring school lab PC parts (and a laptop peek).

## Play on this laptop

```bash
npm install
npm run play
```

Open the Local URL shown in the terminal.

## Play on iPad (same Wi‑Fi)

1. On the laptop, run `npm run play` (uses Vite `--host`).
2. Find your laptop LAN IP (macOS: `ipconfig getifaddr en0`).
3. On the iPad Safari, open `http://THAT_IP:5173`.
```

- [ ] **Step 2: Polish** — ensure star-pop on map, scene-enter on screens, cheer on reward; verify locked buttons not focus-trapping; no harsh fail UI.

- [ ] **Step 3: Build + test**

```bash
npm test
npm run build
```

Expected: tests pass; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add README.md src
git commit -m "docs: add home Wi-Fi play instructions and polish UI"
```

---

## Self-review (plan vs spec)

| Spec item | Task |
|-----------|------|
| Welcome → map → station → laptop → celebration | 3, 4, 5, 7 |
| 9 lab stations + laptop bonus | 2, 6, 7 |
| Mini-games per station | 5–6 |
| Sequential unlock + replay done | 2, 4 |
| localStorage `cla-progress` | 2 |
| Vite `--host` / iPad | 1, 8 |
| No sidekick; short copy | 2, 3 |
| Visual theme constraints | 1, 8 |
| Gentle fail; back to map | 5, 6 |

No TBD placeholders. Types aligned: `LabStationId`, `StationId`, `MiniGameProps.onComplete`, `completeStation(progress, id)`.
