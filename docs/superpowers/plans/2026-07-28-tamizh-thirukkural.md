# Tamizh · Thirukkural Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Add Tamizh hub section with all 1,330 Thirukkurals and kid-friendly Tamil + English meanings.

**Architecture:** Build-time script turns open Thirukkural JSON into slim `kurals.generated.ts` + chapter metadata. Screens mirror Space learn flow (hub → paals → chapters → card reader). Progress tracks read chapters.

**Tech Stack:** React 19, Vite, TypeScript, Vitest (existing)

## Global Constraints

- Offline bundled content only
- Kid copy ages 5–10; Love book age-safe
- Match existing hub patterns (Welcome card, screens, progress migration)
- Fredoka/Nunito, large taps, SFX

---

## Task 1: Generate kid-friendly dataset

- [ ] Add `scripts/gen-thirukkural.mjs` that reads open source JSON and writes `src/content/thirukkural/kurals.generated.ts` + chapters
- [ ] Include all 1330 kurals with `line1`, `line2`, `meaningTa`, `meaningEn`
- [ ] Unit-test content helpers (counts, chapter ranges)

## Task 2: Progress + types + screens

- [ ] Extend `Screen`, `AppProgress`, progress load/save/migration
- [ ] `TamizhHome`, `ThirukkuralPaals`, `ThirukkuralChapters`, `ThirukkuralRead`
- [ ] Wire Welcome + App.tsx + CSS

## Task 3: Verify

- [ ] `npm test` and `npm run build`
- [ ] Commit, push, PR
