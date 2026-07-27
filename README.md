# Computer Lab Adventure

A colorful game hub for kids — **Parts of the computer** (lab story + mini-games) and **Fun with Words** (rainbow typing practice).

Built for a 6-year-old explorer: short sentences, big taps, playable on a laptop and iPad on the same Wi‑Fi. Fun with Words uses the **physical keyboard** on the laptop.

## Play on this laptop

```bash
npm install
npm run play
```

Open the **Local** URL shown in the terminal (usually `http://localhost:5173`).

From the hub, pick:

- **Parts of the computer** — explore lab PC parts
- **Fun with Words** — type themed words that drop from a rainbow

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

(Lab adventure works great on iPad; Fun with Words is best on the laptop keyboard.)

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run play` | Dev server on your home network |
| `npm run dev` | Dev server on localhost only |
| `npm test` | Run unit tests |
| `npm run build` | Production build |
| `npm run preview` | Preview the build with `--host` |

Progress (lab stars + word level unlocks) is saved in the browser, so a refresh keeps her place.

UI mockup reference: `docs/superpowers/mockups/fun-with-words-mockup.html`
