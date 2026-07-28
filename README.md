# Computer Lab Adventure

A colorful game hub for kids — **Parts of the computer** (lab story + mini-games) and **Fun with Words** (rainbow typing practice).

Built for a 6-year-old explorer: short sentences, big taps, playable on a laptop and iPad on the same Wi‑Fi. Whoever opens it types their own name on the welcome screen (kept in `localStorage`), and the games greet them by it. Fun with Words works with a **physical keyboard** or **on-screen letter taps** (iPad / phone).

## Play on this laptop

```bash
npm install
npm run play
```

Open the **Local** URL shown in the terminal (usually `http://localhost:5173`).

From the hub, pick:

- **Parts of the computer** — explore lab PC parts
- **Fun with Words** — type themed words that drop from a rainbow
- **Jumbled Words** — unscramble letter tiles (Easy / Medium)

## Play on iPad (same Wi‑Fi)

1. On the laptop, run `npm run play` (Vite with `--host`).
2. Find your laptop’s LAN IP:

```bash
ipconfig getifaddr en0
```

(If that prints nothing, try `en1`.)

3. On the iPad, open Safari and go to:

`http://THAT_IP:5173`

Example: `http://192.168.1.20:5173`

(Lab adventure and Fun with Words both work on iPad / phone; laptop keyboard still works for typing too.)

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run play` | Dev server on your home network |
| `npm run dev` | Dev server on localhost only |
| `npm test` | Run unit tests |
| `npm run build` | Production build |
| `npm run preview` | Preview the build with `--host` |

Progress (lab stars, word level unlocks, and jumbled best stars) is saved in the browser only — no database.

## Word sources

Fun with Words and Jumbled Words use **curated kid word lists** with a short hand-written meaning under every word (`src/content/wordMeanings.ts`). A dictionary API was tried first and dropped: asking Datamuse for “body” words returned *entity*, *moral*, *system*, and its definitions read like *“a protuberance on the face housing the nostrils”*. No network needed, so the games work offline.

Jumbled Words uses curated local lists so every word keeps its exact picture clue or category.

Recently seen words are remembered for the browser tab session so the next round prefers new ones.

## Deploy on Vercel

1. Push this repo to GitHub (`akira-games-hub`).
2. In [Vercel](https://vercel.com): **Add New Project** → import `akira-games-hub` → Deploy (Vite is auto-detected).
3. Open the Vercel URL — the site is public, no password.
