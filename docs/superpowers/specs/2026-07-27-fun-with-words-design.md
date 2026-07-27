# Fun with Words + Game Hub — Design Spec

**Date:** 2026-07-27  
**Project:** `computer-lab-adventure` (same folder / same Vite app)  
**Audience:** Akira (~6), short readable words, physical keyboard on laptop  
**Goal:** Turn Welcome into a colorful game hub; add **Fun with Words** as a themed typing practice mode alongside the existing Computer Lab Adventure.

---

## 1. Product summary

The app becomes a small **game collection** for Akira, not only the lab story.

From a bright Welcome hub she can pick:

1. **Parts of the computer** — existing lab adventure (unchanged flow)
2. **Fun with Words** — new one-word-at-a-time typing practice with themed levels
3. **Coming soon** — placeholder card(s) for future games (visible, not playable)

No accounts, no online backend. Progress stays in `localStorage`. Parent still runs `npm run play`; laptop is the primary device for typing.

---

## 2. Tech stack

| Layer | Choice | Notes |
|--------|--------|--------|
| Frontend | React 19 + Vite + TypeScript | Existing app |
| Styling | CSS in existing `App.css` / `index.css` | Brighter kids palette on hub + Words screens |
| Backend | None | Static site only |
| Persistence | `localStorage` | Separate buckets for lab vs words |
| Input | Physical keyboard **and** on-screen letter taps | Phone / iPad friendly |

---

## 3. Experience flow

### 3.1 Welcome hub

- Greeting: **Welcome Akira!**
- Large colorful game cards:
  - **Parts of the computer** → existing map / stations / laptop / celebration
  - **Fun with Words** → words level map (card can show a little rainbow accent)
  - **Coming soon** → disabled/soft-locked card(s)
- Each card: friendly icon/illustration, one short kid line, large tap target
- Hub uses a more colorful treatment; the lab map keeps its current look
- Optional soft rainbow flourish at the very top of the hub (subtle, so it doesn’t fight the cards)

### 3.2 Fun with Words

1. **Level map** — themed cards (Animals, Colors, School, Home, Play). Locked / unlocked / done (star). A friendly **rainbow arc across the top** of Words screens (level map + play) brands the mode.
2. **Typing round** — a **rainbow spans the top** of the play screen. The next word **floats/falls down from the rainbow** into a large typing spot (one word at a time — not a rain of many words). After it lands (or while gently settling), she types it. Correct letters fill green. Wrong key: soft coral flash, cursor does not advance. **Backspace** removes the last accepted letter.
3. **Word cheer** — short success beat (word may sparkle / hop), then the next word drops from the rainbow.
4. **Level clear** — after all words in the level (5–8), unlock next theme + stronger cheer under the rainbow.
5. **Navigation** — clear **Games** control back to the hub from Words screens.

**Falling rule (explicit):** Motion is a short, calm drop from the rainbow into place — readable the whole time, not a fast falling-word shooter. Only one active word per round.

### 3.3 Lab adventure

Unchanged once entered from the hub: map → station → laptop → celebration. Keyboard station keeps the tiny on-screen `CAT` mini-game for story continuity. Fun with Words does **not** share unlock progress with that mini-game in v1.

---

## 4. Typing rules (explicit)

- Physical keyboard **and** big on-screen letter taps (iPad / phone).
- Case-insensitive matching (typing `c` counts for `C`); display words in friendly uppercase for kids.
- Only the next expected letter advances progress.
- Wrong key: visual nudge only; no advance; no hard fail of the whole word.
- Backspace: undo one correctly typed letter (if any).
- No timer and no WPM display on screen for the child in v1.
- Completing a word increments a simple `wordsTypedCount` for stars/feedback.

---

## 5. Word levels (v1)

Short words, mostly 3–5 letters, kid-familiar themes:

| Order | Level id | Theme | Role |
|-------|----------|--------|------|
| 1 | `animals` | Animals | Always unlocked |
| 2 | `colors` | Colors | Unlocks after Animals clear |
| 3 | `school` | School | Unlocks after Colors clear |
| 4 | `home` | Home | Unlocks after School clear |
| 5 | `play` | Play | Unlocks after Home clear |

Each level contains **5–8** words. Cleared levels remain replayable. Exact word lists live in `content/wordLevels.ts` at implementation time (simple nouns/adjectives; avoid tricky spelling).

---

## 6. Progress model

Extend persistence with two logical buckets (same or versioned storage key as today, migrated carefully):

```ts
type AppProgress = {
  lab: { completed: StationId[] } // existing shape
  words: {
    unlockedLevelIds: string[] // includes at least 'animals'
    completedLevelIds: string[]
    wordsTypedCount: number
  }
}
```

**Unlock rule:** `animals` always unlocked. Completing a level appends it to `completedLevelIds` and unlocks the next id in order.

Refresh must not wipe lab stars or words unlocks.

---

## 7. UI direction (kids-friendly, colorful)

- **Palette:** sky blue, sunny yellow, coral cheers, leafy green for correct letters, soft lavender panels — high contrast for readability.
- **Type:** Fredoka titles, Nunito body; typing word extra large with clear letter spacing.
- **Hub cards:** distinct color stripe per game, soft shadow, short bounce on press.
- **Rainbow:** Classic **stacked color arcs** (red → orange → yellow → green → blue → violet) across the **top** of Fun with Words screens, plus a smaller version on the hub / Fun with Words card. Soft candy colors — not neon strobing, not a single gradient blob.
- **Word drop:** Word starts near the rainbow and eases down into the typing area (~0.6–1s), then stays put for typing. Large, high-contrast letters remain readable during the fall.
- **Typing feedback:** current letter gently emphasized; success = green fill + light sparkle; mistake = quick coral shake (not harsh red).
- **Motion budget:** rainbow-present word drop, card bounce, letter pop, level-clear confetti-style burst — calm, not strobing.
- Lab screens: no full redesign; only hub + Fun with Words get the brighter treatment.

---

## 8. App structure

Same repo / same Vite entry.

| Area | Change |
|------|--------|
| `Welcome` | Becomes game hub picker |
| `App` screen state | Add words screens (`words-map`, `words-play`, `words-clear`) |
| `content/wordLevels.ts` | Themes + word lists |
| `progress/` | Load/save/migrate words + lab |
| `screens/` | New Words screens |
| Existing games / map | Untouched except entry from hub |

**Out of scope (v1):** backend, accounts, sync across devices, timers/WPM UI, on-screen keyboard for Words, voice, multiplayer, parent dashboard.

---

## 9. Success criteria

- Akira opens the hub and can choose Parts of the computer or Fun with Words.
- She finishes Animals on the physical keyboard (wrong keys don’t advance; Backspace works).
- Colors unlocks; refresh keeps her unlocks and lab stars.
- Hub and Words screens feel clearly more colorful and kid-friendly than a plain form UI.
- Words play screen shows a top rainbow; each new word visibly drops from it before typing.
- Future games can be added as another hub card without restructuring the lab.

---

## 10. Testing focus

- Progress migrate/load/save for words unlocks.
- Typing reducer: correct / wrong / backspace / word complete / level complete.
- Hub navigation: lab entry and words entry return correctly to hub.
- Word lists: every word is A–Z letters only, length within 3–5 (or explicitly allowed exceptions if any).
