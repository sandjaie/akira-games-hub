# Computer Lab Adventure

A story + mini-game site for kids exploring school lab PC parts (and a laptop peek).

Built for a 6-year-old explorer: short sentences, big taps, playable on a laptop and iPad on the same Wi‑Fi.

## Play on this laptop

```bash
npm install
npm run play
```

Open the **Local** URL shown in the terminal (usually `http://localhost:5173`).

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

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run play` | Dev server on your home network |
| `npm run dev` | Dev server on localhost only |
| `npm test` | Run unit tests |
| `npm run build` | Production build |
| `npm run preview` | Preview the build with `--host` |

Progress (stars) is saved in the browser, so a refresh keeps her place.
