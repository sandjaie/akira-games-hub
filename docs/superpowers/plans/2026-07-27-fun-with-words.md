# Fun with Words + Game Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Welcome into a colorful game hub and add Fun with Words (themed levels, physical keyboard, rainbow word-drop) inside the existing Computer Lab Adventure Vite app.

**Architecture:** Same SPA with extended screen union (`welcome` hub, lab flow unchanged, plus `words-map` / `words-play` / `words-clear`). `localStorage` migrates to `{ lab, words }`. Pure helpers for word levels, unlocks, and typing; React screens for hub/rainbow UI. Visual reference: `docs/superpowers/mockups/fun-with-words-mockup.html`.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, React Testing Library, global CSS (Fredoka/Nunito already in `index.html`).

## Global Constraints

- Explorer name: `Akira` via `src/content/explorer.ts` (`EXPLORER_NAME`)
- No backend, accounts, timers, or WPM UI in v1
- Fun with Words: physical keyboard only; case-insensitive; wrong key does not advance; Backspace undoes one correct letter
- One word at a time; calm drop from classic stacked rainbow arcs (not a multi-word shooter)
- Levels in order: `animals` → `colors` → `school` → `home` → `play`; `animals` always unlocked
- Lab KeyboardGame (`CAT` tap keys) stays as-is; no shared unlocks with Fun with Words
- Progress key remains `cla-progress` with v2 shape + migration from `{ completed: StationId[] }`
- Kids-friendly colorful hub + Words UI; lab map look unchanged
- Reference mockup: `docs/superpowers/mockups/fun-with-words-mockup.html`
- Spec: `docs/superpowers/specs/2026-07-27-fun-with-words-design.md`

---

## File structure

```
src/
  types.ts                          # Screen union + AppProgress types
  content/
    explorer.ts                     # existing
    stations.ts                     # existing
    wordLevels.ts                   # NEW themes + words
    wordLevels.test.ts              # NEW
  progress/
    progress.ts                     # migrate to AppProgress; lab + words helpers
    progress.test.ts                # extend
  words/
    typing.ts                       # NEW pure typing reducer
    typing.test.ts                  # NEW
  components/
    Rainbow.tsx                     # NEW classic stacked arcs
  screens/
    Welcome.tsx                     # hub picker
    LabMap.tsx                      # add Games back
    WordsLevelMap.tsx               # NEW
    WordsPlay.tsx                   # NEW rainbow + typing
    WordsLevelClear.tsx             # NEW
    Celebration.tsx                 # Games → hub
    StationScene.tsx / LaptopBonus  # unchanged behavior
  App.tsx                           # wire screens + progress.lab / progress.words
  App.css                           # hub + words styles (from mockup)
```

---

### Task 1: Word level content module

**Files:**
- Create: `src/content/wordLevels.ts`
- Create: `src/content/wordLevels.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type WordLevelId = 'animals' | 'colors' | 'school' | 'home' | 'play'`
  - `export type WordLevel = { id: WordLevelId; title: string; emoji: string; words: string[] }`
  - `export const WORD_LEVEL_ORDER: WordLevelId[]`
  - `export const WORD_LEVELS: Record<WordLevelId, WordLevel>`
  - `export function getWordLevel(id: WordLevelId): WordLevel`

- [ ] **Step 1: Write the failing test**

```ts
// src/content/wordLevels.test.ts
import { describe, expect, it } from 'vitest'
import { WORD_LEVEL_ORDER, WORD_LEVELS } from './wordLevels'

describe('wordLevels', () => {
  it('has five levels in unlock order', () => {
    expect(WORD_LEVEL_ORDER).toEqual([
      'animals',
      'colors',
      'school',
      'home',
      'play',
    ])
  })

  it('each level has 5–8 uppercase A–Z words of length 3–5', () => {
    for (const id of WORD_LEVEL_ORDER) {
      const level = WORD_LEVELS[id]
      expect(level.words.length).toBeGreaterThanOrEqual(5)
      expect(level.words.length).toBeLessThanOrEqual(8)
      for (const word of level.words) {
        expect(word).toMatch(/^[A-Z]{3,5}$/)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/content/wordLevels.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

```ts
// src/content/wordLevels.ts
export type WordLevelId = 'animals' | 'colors' | 'school' | 'home' | 'play'

export type WordLevel = {
  id: WordLevelId
  title: string
  emoji: string
  words: string[]
}

export const WORD_LEVEL_ORDER: WordLevelId[] = [
  'animals',
  'colors',
  'school',
  'home',
  'play',
]

export const WORD_LEVELS: Record<WordLevelId, WordLevel> = {
  animals: {
    id: 'animals',
    title: 'Animals',
    emoji: '🐾',
    words: ['CAT', 'DOG', 'BIRD', 'FISH', 'FROG', 'BEAR'],
  },
  colors: {
    id: 'colors',
    title: 'Colors',
    emoji: '🎨',
    words: ['RED', 'BLUE', 'PINK', 'GOLD', 'GREEN'],
  },
  school: {
    id: 'school',
    title: 'School',
    emoji: '📚',
    words: ['BOOK', 'PEN', 'DESK', 'BAG', 'READ'],
  },
  home: {
    id: 'home',
    title: 'Home',
    emoji: '🏠',
    words: ['BED', 'DOOR', 'CUP', 'LAMP', 'SOFA'],
  },
  play: {
    id: 'play',
    title: 'Play',
    emoji: '🎮',
    words: ['BALL', 'GAME', 'JUMP', 'SING', 'DRAW'],
  },
}

export function getWordLevel(id: WordLevelId): WordLevel {
  return WORD_LEVELS[id]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/content/wordLevels.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/wordLevels.ts src/content/wordLevels.test.ts
git commit -m "feat: add Fun with Words level word lists"
```

---

### Task 2: Progress v2 — lab + words with migration

**Files:**
- Modify: `src/types.ts`
- Modify: `src/progress/progress.ts`
- Modify: `src/progress/progress.test.ts`
- Modify (call sites for `Progress.completed` → `progress.lab.completed`): `src/App.tsx`, `src/screens/LabMap.tsx`, and any other file that reads `progress.completed` / `Progress`

**Interfaces:**
- Consumes: `WORD_LEVEL_ORDER`, `WordLevelId` from `content/wordLevels`
- Produces:
  - `export type LabProgress = { completed: StationId[] }`
  - `export type WordsProgress = { unlockedLevelIds: WordLevelId[]; completedLevelIds: WordLevelId[]; wordsTypedCount: number }`
  - `export type AppProgress = { lab: LabProgress; words: WordsProgress }`
  - Keep name `Progress` as alias of `AppProgress` OR rename call sites to `AppProgress` (prefer `AppProgress`; update imports)
  - `emptyProgress(): AppProgress`
  - `loadProgress(): AppProgress` — migrates legacy `{ completed: StationId[] }`
  - `saveProgress(p: AppProgress): void`
  - `clearProgress(): void`
  - Existing lab helpers take `lab: LabProgress` OR accept `AppProgress` and use `.lab` — **use `LabProgress` for lab helpers**
  - `completeStation(lab, id): LabProgress`
  - `emptyWordsProgress(): WordsProgress` — `unlockedLevelIds: ['animals']`, empty completed, count 0
  - `getWordsStatus(words, id): 'locked' | 'available' | 'done'`
  - `completeWordLevel(words, id): WordsProgress` — marks done, unlocks next, idempotent
  - `recordTypedWord(words): WordsProgress` — increments `wordsTypedCount`

- [ ] **Step 1: Write failing migration / words tests**

Add to `src/progress/progress.test.ts`:

```ts
import { WORD_LEVEL_ORDER } from '../content/wordLevels'
import {
  completeWordLevel,
  getWordsStatus,
  loadProgress,
  recordTypedWord,
  saveProgress,
} from './progress'

it('migrates legacy lab-only progress', () => {
  localStorage.setItem('cla-progress', JSON.stringify({ completed: ['monitor'] }))
  const p = loadProgress()
  expect(p.lab.completed).toEqual(['monitor'])
  expect(p.words.unlockedLevelIds).toContain('animals')
  expect(getWordsStatus(p.words, 'animals')).toBe('available')
  expect(getWordsStatus(p.words, 'colors')).toBe('locked')
})

it('unlocks next word level after clear', () => {
  let words = loadProgress().words
  words = completeWordLevel(words, 'animals')
  expect(getWordsStatus(words, 'animals')).toBe('done')
  expect(getWordsStatus(words, 'colors')).toBe('available')
  words = recordTypedWord(words)
  expect(words.wordsTypedCount).toBe(1)
})

it('keeps animals unlocked even if storage omits it', () => {
  saveProgress({
    lab: { completed: [] },
    words: {
      unlockedLevelIds: [],
      completedLevelIds: [],
      wordsTypedCount: 0,
    },
  })
  const p = loadProgress()
  expect(p.words.unlockedLevelIds).toContain('animals')
})
```

Update existing tests to use `p.lab` / `completeStation(p.lab, …)` and wrap saves as `AppProgress`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/progress/progress.test.ts`
Expected: FAIL on new APIs / shape

- [ ] **Step 3: Implement types + progress module**

In `src/types.ts`, replace `Progress` with:

```ts
import type { WordLevelId } from './content/wordLevels'

export type LabProgress = { completed: StationId[] }

export type WordsProgress = {
  unlockedLevelIds: WordLevelId[]
  completedLevelIds: WordLevelId[]
  wordsTypedCount: number
}

export type AppProgress = {
  lab: LabProgress
  words: WordsProgress
}

export type Screen =
  | { name: 'welcome' }
  | { name: 'map' }
  | { name: 'station'; stationId: LabStationId }
  | { name: 'laptop' }
  | { name: 'celebration' }
  | { name: 'words-map' }
  | { name: 'words-play'; levelId: WordLevelId }
  | { name: 'words-clear'; levelId: WordLevelId }
```

Rewrite `progress.ts` accordingly (sketch):

```ts
const KEY = 'cla-progress'

export function emptyWordsProgress(): WordsProgress {
  return {
    unlockedLevelIds: ['animals'],
    completedLevelIds: [],
    wordsTypedCount: 0,
  }
}

export function emptyProgress(): AppProgress {
  return { lab: { completed: [] }, words: emptyWordsProgress() }
}

function normalizeWords(raw: Partial<WordsProgress> | undefined): WordsProgress {
  const unlocked = new Set(raw?.unlockedLevelIds ?? [])
  unlocked.add('animals')
  return {
    unlockedLevelIds: [...unlocked] as WordLevelId[],
    completedLevelIds: (raw?.completedLevelIds ?? []) as WordLevelId[],
    wordsTypedCount: raw?.wordsTypedCount ?? 0,
  }
}

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed && Array.isArray(parsed.completed) && !parsed.lab) {
      return {
        lab: { completed: parsed.completed as StationId[] },
        words: emptyWordsProgress(),
      }
    }
    const lab = parsed.lab as LabProgress | undefined
    if (!lab || !Array.isArray(lab.completed)) return emptyProgress()
    return {
      lab: { completed: lab.completed },
      words: normalizeWords(parsed.words as WordsProgress),
    }
  } catch {
    return emptyProgress()
  }
}

export function completeStation(lab: LabProgress, id: StationId): LabProgress {
  if (lab.completed.includes(id)) return lab
  return { completed: [...lab.completed, id] }
}

export function getWordsStatus(
  words: WordsProgress,
  id: WordLevelId,
): 'locked' | 'available' | 'done' {
  if (words.completedLevelIds.includes(id)) return 'done'
  if (words.unlockedLevelIds.includes(id) || id === 'animals') return 'available'
  return 'locked'
}

export function completeWordLevel(
  words: WordsProgress,
  id: WordLevelId,
): WordsProgress {
  const completedLevelIds = words.completedLevelIds.includes(id)
    ? words.completedLevelIds
    : [...words.completedLevelIds, id]
  const unlocked = new Set(words.unlockedLevelIds)
  unlocked.add('animals')
  unlocked.add(id)
  const idx = WORD_LEVEL_ORDER.indexOf(id)
  const next = WORD_LEVEL_ORDER[idx + 1]
  if (next) unlocked.add(next)
  return {
    ...words,
    completedLevelIds,
    unlockedLevelIds: [...unlocked] as WordLevelId[],
  }
}

export function recordTypedWord(words: WordsProgress): WordsProgress {
  return { ...words, wordsTypedCount: words.wordsTypedCount + 1 }
}
```

Update lab helpers (`getLabStatus`, `isLabComplete`, …) to take `LabProgress`. Update `App.tsx` / `LabMap.tsx` / `Celebration` replay to use `progress.lab` and `setProgress` with full `AppProgress`.

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: PASS (fix any call-site type errors)

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/progress/progress.ts src/progress/progress.test.ts src/App.tsx src/screens/LabMap.tsx src/screens/Celebration.tsx
git commit -m "feat: migrate progress to lab + words buckets"
```

---

### Task 3: Typing reducer

**Files:**
- Create: `src/words/typing.ts`
- Create: `src/words/typing.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type TypingState = { word: string; index: number; wrong: boolean }`
  - `export type TypingEvent = { type: 'KEY'; key: string } | { type: 'BACKSPACE' } | { type: 'CLEAR_WRONG' } | { type: 'RESET'; word: string }`
  - `export function createTypingState(word: string): TypingState` — uppercases word, index 0
  - `export function reduceTyping(state: TypingState, event: TypingEvent): TypingState`
  - `export function isWordComplete(state: TypingState): boolean`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { createTypingState, isWordComplete, reduceTyping } from './typing'

describe('reduceTyping', () => {
  it('accepts correct letter case-insensitively', () => {
    let s = createTypingState('Cat')
    s = reduceTyping(s, { type: 'KEY', key: 'c' })
    expect(s.index).toBe(1)
    expect(s.wrong).toBe(false)
  })

  it('rejects wrong letter without advancing', () => {
    let s = createTypingState('CAT')
    s = reduceTyping(s, { type: 'KEY', key: 'x' })
    expect(s.index).toBe(0)
    expect(s.wrong).toBe(true)
  })

  it('backspaces one correct letter', () => {
    let s = createTypingState('CAT')
    s = reduceTyping(s, { type: 'KEY', key: 'c' })
    s = reduceTyping(s, { type: 'BACKSPACE' })
    expect(s.index).toBe(0)
  })

  it('completes the word', () => {
    let s = createTypingState('HI')
    s = reduceTyping(s, { type: 'KEY', key: 'h' })
    s = reduceTyping(s, { type: 'KEY', key: 'i' })
    expect(isWordComplete(s)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/words/typing.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement**

```ts
export type TypingState = { word: string; index: number; wrong: boolean }

export type TypingEvent =
  | { type: 'KEY'; key: string }
  | { type: 'BACKSPACE' }
  | { type: 'CLEAR_WRONG' }
  | { type: 'RESET'; word: string }

export function createTypingState(word: string): TypingState {
  return { word: word.toUpperCase(), index: 0, wrong: false }
}

export function isWordComplete(state: TypingState): boolean {
  return state.index >= state.word.length
}

export function reduceTyping(state: TypingState, event: TypingEvent): TypingState {
  switch (event.type) {
    case 'RESET':
      return createTypingState(event.word)
    case 'CLEAR_WRONG':
      return { ...state, wrong: false }
    case 'BACKSPACE':
      return { ...state, index: Math.max(0, state.index - 1), wrong: false }
    case 'KEY': {
      if (isWordComplete(state)) return state
      if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return state
      const expected = state.word[state.index]
      if (event.key.toUpperCase() === expected) {
        return { ...state, index: state.index + 1, wrong: false }
      }
      return { ...state, wrong: true }
    }
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/words/typing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/words/typing.ts src/words/typing.test.ts
git commit -m "feat: add Fun with Words typing reducer"
```

---

### Task 4: Rainbow component

**Files:**
- Create: `src/components/Rainbow.tsx`
- Modify: `src/App.css` (rainbow styles ported from mockup)

**Interfaces:**
- Consumes: none
- Produces: `export function Rainbow({ size?: 'small' | 'large' }): JSX.Element` — six stacked arcs, `aria-hidden`

- [ ] **Step 1: Add CSS from mockup**

Copy `.rainbow` / `.rainbow-arc` / size variants from `docs/superpowers/mockups/fun-with-words-mockup.html` into `App.css`.

- [ ] **Step 2: Implement component**

```tsx
type Props = { size?: 'small' | 'large' }

export function Rainbow({ size = 'large' }: Props) {
  return (
    <div className={`rainbow ${size === 'small' ? 'small' : ''}`} aria-hidden="true">
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
    </div>
  )
}
```

- [ ] **Step 3: Manual check**

Temporarily render `<Rainbow />` in Welcome, run `npm run play`, confirm classic arcs. Remove temporary render if Welcome not ready (Task 5 will use it).

- [ ] **Step 4: Commit**

```bash
git add src/components/Rainbow.tsx src/App.css
git commit -m "feat: add classic stacked Rainbow component"
```

---

### Task 5: Welcome hub UI

**Files:**
- Modify: `src/screens/Welcome.tsx`
- Modify: `src/App.css` (hub cards)
- Modify: `src/App.tsx` (hub callbacks)

**Interfaces:**
- Consumes: `EXPLORER_NAME`, `Rainbow`
- Produces: `Welcome({ onLab: () => void; onWords: () => void })`

- [ ] **Step 1: Rewrite Welcome as hub**

```tsx
import { EXPLORER_NAME } from '../content/explorer'
import { Rainbow } from '../components/Rainbow'

type Props = { onLab: () => void; onWords: () => void }

export function Welcome({ onLab, onWords }: Props) {
  return (
    <main className="screen welcome hub">
      <Rainbow size="small" />
      <p className="eyebrow">{EXPLORER_NAME}&apos;s games</p>
      <h1 className="display">Welcome {EXPLORER_NAME}!</h1>
      <p className="subtitle">Pick a game</p>
      <div className="hub-cards">
        <button type="button" className="hub-card lab" onClick={onLab}>
          <span className="hub-icon" aria-hidden="true">🖥️</span>
          <span>
            <span className="hub-title">Parts of the computer</span>
            <span className="hub-blurb">Find the parts!</span>
          </span>
        </button>
        <button type="button" className="hub-card words" onClick={onWords}>
          <span className="hub-icon" aria-hidden="true">🌈</span>
          <span>
            <span className="hub-title">Fun with Words</span>
            <span className="hub-blurb">Type fun words!</span>
          </span>
        </button>
        <button type="button" className="hub-card soon" disabled>
          <span className="hub-icon" aria-hidden="true">✨</span>
          <span>
            <span className="hub-title">Coming soon</span>
            <span className="hub-blurb">More games later</span>
          </span>
        </button>
      </div>
    </main>
  )
}
```

Style `.hub-cards` / `.hub-card` like the mockup (colorful, bounce).

- [ ] **Step 2: Wire App**

```tsx
if (screen.name === 'welcome') {
  return (
    <Welcome
      onLab={() => setScreen({ name: 'map' })}
      onWords={() => setScreen({ name: 'words-map' })}
    />
  )
}
```

(Temporary: `words-map` can render a stub `<main>Words coming</main>` until Task 6 — or skip stub and land Task 6 immediately after.)

- [ ] **Step 3: Manual check**

Run: `npm run play` — hub shows rainbow + three cards; lab still opens map.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Welcome.tsx src/App.tsx src/App.css
git commit -m "feat: turn Welcome into colorful game hub"
```

---

### Task 6: Words level map + clear screens

**Files:**
- Create: `src/screens/WordsLevelMap.tsx`
- Create: `src/screens/WordsLevelClear.tsx`
- Modify: `src/App.tsx`
- Modify: `src/screens/LabMap.tsx` — add `onHub: () => void` + Games button
- Modify: `src/screens/Celebration.tsx` — `onHub` instead of/in addition to map replay path

**Interfaces:**
- Consumes: `WORD_LEVEL_ORDER`, `WORD_LEVELS`, `getWordsStatus`, `Rainbow`, `WordsProgress`
- Produces:
  - `WordsLevelMap({ words, onBack, onPlay }: { words: WordsProgress; onBack: () => void; onPlay: (id: WordLevelId) => void })`
  - `WordsLevelClear({ levelId, onMap, onHub }: { levelId: WordLevelId; onMap: () => void; onHub: () => void })`

- [ ] **Step 1: Implement WordsLevelMap**

List levels with locked/available/done; Games back button; Rainbow on top; play only if not locked.

- [ ] **Step 2: Implement WordsLevelClear**

Cheer copy: `You finished {title}!`; buttons: More themes → `onMap`; Games → `onHub`.

- [ ] **Step 3: Wire App screens + LabMap/Celebration hub returns**

```tsx
if (screen.name === 'words-map') {
  return (
    <WordsLevelMap
      words={progress.words}
      onBack={() => setScreen({ name: 'welcome' })}
      onPlay={(levelId) => setScreen({ name: 'words-play', levelId })}
    />
  )
}

if (screen.name === 'words-clear') {
  return (
    <WordsLevelClear
      levelId={screen.levelId}
      onMap={() => setScreen({ name: 'words-map' })}
      onHub={() => setScreen({ name: 'welcome' })}
    />
  )
}
```

LabMap: add top `Games` → `onHub`. Celebration: primary Games → hub; replay clears full `emptyProgress()` and goes to welcome (existing behavior OK).

- [ ] **Step 4: Manual check**

Hub → Words → see levels; Games returns hub; lab map Games returns hub.

- [ ] **Step 5: Commit**

```bash
git add src/screens/WordsLevelMap.tsx src/screens/WordsLevelClear.tsx src/screens/LabMap.tsx src/screens/Celebration.tsx src/App.tsx src/App.css
git commit -m "feat: add Fun with Words level map and clear screens"
```

---

### Task 7: Words play screen (rainbow drop + keyboard)

**Files:**
- Create: `src/screens/WordsPlay.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css` (play stage, falling word, shake)

**Interfaces:**
- Consumes: `getWordLevel`, typing helpers, `recordTypedWord`, `completeWordLevel`, `Rainbow`
- Produces: `WordsPlay({ levelId, words, onWordsChange, onBack, onLevelComplete })` where `onWordsChange: (w: WordsProgress) => void`, `onLevelComplete: () => void`

- [ ] **Step 1: Implement WordsPlay**

Behavior:
1. `wordIndex` starts at 0; `createTypingState(level.words[0])`
2. On mount / word change: CSS class triggers `fall-from-rainbow` animation (~0.9s)
3. `window` `keydown` listener: Backspace → `BACKSPACE`; single letter → `KEY`; ignore if meta/ctrl
4. On `wrong`, add shake class; `CLEAR_WRONG` after ~350ms
5. When `isWordComplete`: call `onWordsChange(recordTypedWord(words))`; short cheer (300–600ms); if more words, reset next word with drop; else `onWordsChange(completeWordLevel(...))` then `onLevelComplete()`
6. Header: Themes back; show level title; Rainbow above drop zone
7. Render letters: done (green) / current (underlined) / todo (muted)

```tsx
// key wiring sketch inside useEffect
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Backspace') {
    e.preventDefault()
    setTyping((s) => reduceTyping(s, { type: 'BACKSPACE' }))
    return
  }
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
    e.preventDefault()
    setTyping((s) => reduceTyping(s, { type: 'KEY', key: e.key }))
  }
}
```

- [ ] **Step 2: Wire App**

```tsx
if (screen.name === 'words-play') {
  return (
    <WordsPlay
      levelId={screen.levelId}
      words={progress.words}
      onWordsChange={(words) => setProgress((p) => ({ ...p, words }))}
      onBack={() => setScreen({ name: 'words-map' })}
      onLevelComplete={() =>
        setScreen({ name: 'words-clear', levelId: screen.levelId })
      }
    />
  )
}
```

Ensure `completeWordLevel` runs inside WordsPlay before `onLevelComplete`.

- [ ] **Step 3: Manual check**

Play Animals: word drops from rainbow; type correctly; wrong key shakes; Backspace works; finish level → clear screen → Colors unlocked; refresh keeps unlocks.

- [ ] **Step 4: Commit**

```bash
git add src/screens/WordsPlay.tsx src/App.tsx src/App.css
git commit -m "feat: add rainbow word-drop typing play screen"
```

---

### Task 8: Polish, README, full verification

**Files:**
- Modify: `README.md`
- Modify: `src/App.css` as needed for motion polish
- Optional: small RTL test for Welcome hub buttons

- [ ] **Step 1: Update README**

Document hub: Parts of the computer + Fun with Words; typing needs physical keyboard; progress includes word levels; link mockup path for designers.

- [ ] **Step 2: Run full test suite + build**

```bash
npm test
npm run build
```

Expected: all PASS; build succeeds.

- [ ] **Step 3: Play smoke checklist**

1. Hub rainbow + cards  
2. Lab still completes a station  
3. Words Animals → unlock Colors  
4. Refresh keeps both lab stars and Colors unlock  
5. Coming soon disabled  

- [ ] **Step 4: Commit**

```bash
git add README.md src/App.css src/screens/*.tsx
git commit -m "docs: note game hub and Fun with Words play instructions"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Game hub with lab / words / coming soon | 5 |
| Classic stacked rainbow | 4, mockup |
| Word drop from rainbow | 7 |
| Themed levels + unlock order | 1, 2, 6 |
| Keyboard typing rules + Backspace | 3, 7 |
| Progress lab + words migration | 2 |
| Level clear cheer | 6, 7 |
| Lab adventure unchanged entry | 5, 6 |
| No backend / no WPM | Global |
| Colorful kids UI | 5–7, 8 |

---

## Self-review notes

- No TBD placeholders; word lists are concrete.
- `Progress` → `AppProgress` / `LabProgress` naming is consistent across Task 2+.
- Typing and progress stay pure/tested before UI.
- Celebration/LabMap hub navigation included so Akira is never stuck without Games.
