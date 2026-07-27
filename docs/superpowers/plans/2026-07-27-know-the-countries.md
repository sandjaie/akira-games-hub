# Know the Countries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Game 4 “Know the Countries” (Flags/Maps × Easy/Medium, 5 questions, local SVG assets, progress + tests) inside akira-games-hub.

**Architecture:** Mirror Jumbled screen flow; typed country content; pure quiz helpers; React SVG flags/maps; extend `AppProgress.countries` with safe migration.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, existing Web Audio SFX. No new packages.

## Global Constraints

- No external APIs or hotlinked images during play.
- Audience ~6; large targets; ARIA; reduced-motion; name labels not color-only.
- Stars: 5→3, 3–4→2, 1–2→1, 0→0.
- Preserve lab/words/jumbled progress.
- Match portal visual language (Fredoka/Nunito, hub-cards, SoundToggle).

---

### Task 1: Content + quiz helpers + tests

**Files:**
- Create: `src/content/countries.ts`
- Create: `src/countries/quiz.ts`
- Create: `src/countries/quiz.test.ts`
- Create: `src/content/countries.test.ts`

- [ ] Implement country catalog (12), `ROUND_SIZE = 5`, quiz pickers, `starsFromScore`, tests; run vitest on these files.

### Task 2: Flag + map SVG components

**Files:**
- Create: `src/content/flags/FlagSvg.tsx` (registry of 12 simplified flags)
- Create: `src/content/maps/ContinentMap.tsx` (boards with highlight + selectable hotspots)

- [ ] Bundle simplified SVGs; export by country id / board id.

### Task 3: Progress model + migration tests

**Files:**
- Modify: `src/types.ts`, `src/progress/progress.ts`, `src/progress/progress.test.ts`

- [ ] Add `CountriesProgress`, normalize/migrate, `recordCountriesRound`; update fixtures that construct full `AppProgress`.

### Task 4: Screens + hub + App wiring + CSS

**Files:**
- Create: `CountriesMode.tsx`, `CountriesDifficulty.tsx`, `CountriesPlay.tsx`, `CountriesResults.tsx`
- Modify: `Welcome.tsx`, `App.tsx`, `App.css`, `types.ts` (Screen union)

- [ ] Full flow with SFX; hub globe card; run `npm test && npm run build`.

---
