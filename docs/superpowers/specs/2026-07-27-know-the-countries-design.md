# Know the Countries — Design Spec

**Date:** 2026-07-27  
**App:** Akira Games Hub (React + Vite + TypeScript)  
**Audience:** ~6 years old · laptop / iPad / phone

## Goal

Add a fourth hub game, **Know the Countries**, for friendly flag and map practice with no network, no timer, and no lives.

## Decisions (approved)

| Topic | Choice |
|-------|--------|
| Flags | Bundled simplified SVG React components |
| Maps | Simplified continent SVGs; highlight (Easy) or 4 hotspots (Medium) |
| Stars | 5→★★★ · 3–4→★★ · 1–2→★ · 0→none |
| Flow | Hub → Mode → Difficulty → Play (5 Q) → Results |
| Approach | Mirror Jumbled screens + pure quiz helpers |

## Navigation

```
welcome
  → countries-mode
    → countries-difficulty { mode: 'flags' | 'maps' }
      → countries-play { mode, difficulty: 'easy' | 'medium' }
        → countries-results { mode, difficulty, score, stars }
```

Results actions: Replay · Change mode · Games.

## Progress

New `countries` bucket on `AppProgress`:

```ts
type CountriesModeKey =
  | 'flags-easy'
  | 'flags-medium'
  | 'maps-easy'
  | 'maps-medium'

type CountriesProgress = {
  completedModes: CountriesModeKey[]
  bestStars: Partial<Record<CountriesModeKey, 1 | 2 | 3>>
}
```

- `recordCountriesRound` raises max stars per key (never lowers); `stars === 0` does not write `bestStars`.
- `loadProgress` / migration: missing `countries` → empty; legacy lab-only and missing-jumbled paths also get empty `countries`.
- Never wipe lab / words / jumbled.

## Content

Twelve countries in `src/content/countries.ts`: India, Japan, China, Australia, Egypt, South Africa, France, Italy, United Kingdom, Canada, United States, Brazil.

Each entry: `id`, `name`, `continent`, `fact`, `similarFlagIds`, `mapBoard`, difficulty tags as needed.

**Flags Medium** distractors prefer `similarFlagIds`, then fill from the set.  
**Flags Easy** three name choices (correct + two others).  
**Maps Easy** highlight region + three names.  
**Maps Medium** country name + four labeled map hotspots (boards always include ≥4 regions; pad with map-only distractor regions if needed).

Visual assets live under `src/content/flags/` and `src/content/maps/` — no hotlinking.

## Play UX

1. Show question (flag or map).
2. Child picks an answer (button or map hotspot).
3. Feedback: green + encouraging copy + `correct` SFX, or gentle correct reveal + `wrong` SFX.
4. Show name, continent, one short fact.
5. Next → after 5, results with score/5, stars, `cheer`.

## Accessibility & polish

- Large targets (≥48px), Fredoka/Nunito, clear focus, ARIA labels on choices and map regions.
- Keyboard + touch; `prefers-reduced-motion` respected.
- Choice labels are country names (not color-only).
- SoundToggle (BGM off on game screens); SFX on tap / correct / wrong / cheer / whoosh.

## Testing

- Quiz helpers: round selection, distractors by difficulty, score→stars.
- Progress: migrate missing `countries`; record best stars without lowering; preserve other games.
- Run `npm test` and `npm run build` before finish.

## Out of scope

External APIs, new npm packages, timers/lives, precise political borders, more than 12 countries in v1.
