# Tamizh · Thirukkural — Design Spec

**Date:** 2026-07-28  
**App:** Akira Games Hub (React + Vite + TypeScript)  
**Audience:** kids ~5–10 · laptop / iPad / phone

## Goal

Add a **Tamizh** hub section with **Thirukkural**: all **1,330** couplets in Tamil, each with a short kid-friendly meaning in **Tamil** and **English**.

## Decisions

| Topic | Choice |
|-------|--------|
| Hub entry | New Welcome card: **Tamizh** |
| Content | Bundled offline JSON (no runtime API); Kaamathupaal + adult adhikarams omitted |
| Source text | Open Thirukkural JSON (Tamil lines + commentaries) |
| Kid meanings | Build-time rewrite: Tamil from clear modern commentary; English simplified for read-aloud |
| Navigation | Hub → Tamizh → Paal (Aram / Porul) → Chapter (10 kurals) → one-kural cards |
| Progress | Chapters marked read when the last kural is reached |
| Quiz | Out of scope for this pass (learn/browse only) |

## Navigation

```
welcome
  → tamizh-home
    → thirukkural-paals
      → thirukkural-chapters { paalId }
        → thirukkural-read { chapterId, kuralIndex }
```

## Content model

```ts
type PaalId = 'aram' | 'porul' | 'inbam'

type Chapter = {
  id: number // 1–133
  paalId: PaalId
  nameTa: string
  nameEn: string // short kid title
  start: number
  end: number
}

type Kural = {
  number: number // 1–1330
  line1: string
  line2: string
  meaningTa: string // kid Tamil
  meaningEn: string // kid English
}
```

- Tamil couplet stays authentic.
- Meanings are short (about one or two sentences), concrete, and read-aloud friendly.
- Book III (Love) uses gentle, age-safe wording (caring / missing someone) without adult framing.

## UX

1. Big Tamil couplet.
2. Tamil meaning for kids.
3. English meaning for kids.
4. Chapter name + “Kural N of 10” (or absolute number).
5. Prev / Next; finishing a chapter marks it read and returns to the chapter list.
6. Large taps, SoundToggle, whoosh/tap/cheer SFX like other learn screens.

## Progress

```ts
type TamizhProgress = {
  readChapterIds: number[]
}
```

Missing `tamizh` on load → empty. Never wipe other progress buckets.

## Out of scope

- Quiz mode
- Other Tamizh games (can plug in later under `tamizh-home`)
- Network fetch at runtime
