# Computer Lab Adventure — Design Spec

**Date:** 2026-07-27  
**Audience:** One 6-year-old explorer (can read short sentences)  
**Devices:** Parent laptop + child’s iPad on home Wi‑Fi  
**Goal:** A story adventure with mini-games that teaches familiar computer parts (school lab PC first, then a laptop bonus)

---

## 1. Product summary

An interactive website where the child is the hero exploring a school computer lab. She visits stations on a lab PC (tower + monitor + keyboard + mouse and insides). Each station has a tiny story beat and one simple mini-game. After all lab stations, a short laptop bonus shows that the same parts live inside a laptop too.

No accounts, no online backend. Parent runs a local static server; iPad opens the site on the home network.

---

## 2. Experience flow

1. **Welcome** — Short intro: she is the explorer in the school computer lab. Large “Let’s go!” button.
2. **Lab map** — Friendly view of a lab desk / PC. Stations show locked / available / done (star). She can revisit finished stations.
3. **Station scene** — For each part:
   - 1–2 short kid-readable sentences (pictures first)
   - One tablet-friendly mini-game
   - “You found it!” cheer + star on the map
4. **Laptop bonus** — Unlocks after all lab stations. Quick compare: same parts, packed smaller.
5. **Celebration** — End screen with replay option.

Progress persists in `localStorage` so refresh does not wipe stars.

---

## 3. Stations (v1)

| ID | Kid name | Real idea | Mini-game |
|----|----------|-----------|-----------|
| `monitor` | Screen | Monitor | Tap what’s showing on the screen |
| `keyboard` | Keyboard | Keyboard | Tap letters to spell a tiny word |
| `mouse` | Mouse | Mouse | Drag the pointer to a target |
| `cpu` | Brain | CPU in the tower | Match “think fast” pairs |
| `memory` | Memory | RAM | Short remember-the-lights |
| `storage` | Storage box | Hard drive / SSD | Sort files into the box |
| `power` | Power | PSU / plug | Plug in / flip the switch |
| `speakers` | Speakers | Speakers | Match quiet → loud |
| `wifi` | Wifi | Network / Wi‑Fi | Connect the floating dots |
| `laptop` | Laptop bonus | Same parts, smaller | Match lab part → laptop spot |

Lab stations: the first nine. Laptop is the finale bonus, not part of the initial map lock order beyond “all lab done.”

**Unlock rule:** Welcome → map with only `monitor` available. Completing a station unlocks the next in this fixed order: monitor → keyboard → mouse → cpu → memory → storage → power → speakers → wifi → laptop bonus. Finished stations stay replayable anytime from the map.

---

## 4. Content tone

- Child is the explorer; no robot sidekick.
- Pictures-first; short sentences she can read alone or with a parent nearby.
- No voice narration in v1.
- Cheerful, calm feedback — soft motion, not noisy flashy effects.
- Avoid scary / technical jargon; use kid names with a tiny optional “grown-up word” if helpful (e.g. Brain = CPU).

---

## 5. Visual design

- Bright school-lab atmosphere (desks, soft daylight, friendly PC shapes) — not flat single-color, not generic purple-gradient AI look, not cream+terracotta cliché.
- Expressive kid-friendly typography (not Inter/Roboto/Arial/system default stack).
- Big tap targets for iPad; works with mouse on laptop.
- One clear composition per screen; no dashboard clutter.
- Map is the hub; station screens are focused (story → game → reward).
- CSS variables for a clear palette; intentional small motions (2–3 signature motions: map star pop, station enter, success cheer).

---

## 6. Technical architecture

- **Stack:** Vite + React + TypeScript. Static build; no backend.
- **Routing:** Simple in-app screen state (welcome | map | station | laptop | celebration) — no auth routes.
- **Data:** Station definitions in one content module (copy, game type, unlock order).
- **Progress:** `localStorage` key e.g. `cla-progress` storing completed station IDs and whether laptop/celebration seen.
- **Serve at home:** `npm run dev -- --host` (or `vite preview --host`) so iPad can reach `http://<laptop-lan-ip>:5173`.
- **No** accounts, analytics, or external APIs required for play.

### Main UI units

| Unit | Responsibility |
|------|----------------|
| `App` | Screen state + progress load/save |
| `Welcome` | Intro + start |
| `LabMap` | Hub, station markers, stars |
| `StationScene` | Story copy + mounts the right mini-game + reward |
| `MiniGames/*` | One component per game type |
| `LaptopBonus` | Compare / match game |
| `Celebration` | End + replay |
| `content/stations.ts` | All kid copy and game config |

Each mini-game exposes: start ready → `onComplete()` when won. StationScene handles reward + progress update.

---

## 7. Interaction & accessibility (kid-focused)

- Touch and click both work; drag games use pointer events.
- Minimum comfortable tap size (~44px+).
- High contrast text on story panels.
- Failure is gentle: try again, no harsh fail screens or timers that punish.
- Optional “Back to map” always available during a station (progress only saved on success).

---

## 8. Out of scope (v1)

- Voice / TTS narration
- Multiple player profiles
- Online multiplayer or leaderboards
- Parent admin panel
- Deep hardware accuracy beyond kid metaphors
- App store packaging

---

## 9. Success criteria

- A 6-year-old can finish the lab tour and laptop bonus with little adult help beyond opening the URL.
- Each station teaches one idea through play, not a wall of text.
- Works on iPad Safari and desktop Chrome/Safari on the home network.
- Progress survives a refresh.
- Parent can start the server with a one-line npm script documented in README.

---

## 10. Implementation notes for planning

Build order suggestion:

1. Scaffold Vite React TS + base layout / theme
2. Screen shell + progress persistence
3. Welcome + Lab map (stations unlockable, stars)
4. StationScene + stub games that call `onComplete`
5. Implement mini-games one by one
6. Laptop bonus + celebration
7. Polish motion, iPad tap targets, README for `--host` play
