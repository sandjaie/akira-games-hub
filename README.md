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
- **Know the Countries** — flags and real maps (Easy / Medium)
- **Space Explorer** — learn space facts, then quiz yourself

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

## Generating space facts

`src/content/space/generatedFacts.ts` holds 1095 facts built from
[Solar System OpenData](https://api.le-systeme-solaire.net/). To refresh it:

```bash
SSO_KEY=<your-key> node scripts/gen-space-facts.mjs
```

The key is read from the environment and **must not** be committed or moved to
runtime — a bearer token in a Vite bundle is readable by anyone who opens
devtools. Build time is safe because the data barely changes.

The rule is the one `spaceLive.ts` already sets: **read numbers and names from
the API, write the sentence ourselves.** Every fact is phrased by a template in
the generator, so correctness comes from the source and reading level comes
from us. Templates check before they speak — the source has no average
temperature for Mercury and no radius for Haumea.

Facts are interleaved by template **and offset per template**, or the rotation
hands a kid Earth's day, Earth's year and Earth's moon count as three cards
running. 1095 facts share 1094 distinct sentences.

Most of the volume comes from comparing bodies rather than describing them:
twelve planets make 66 pairs, and "you would weigh six times more on Jupiter
than on Mars" is the kind a child repeats at dinner. Superlatives (biggest,
coldest, most moons) are computed, never listed.

Two gates keep the tail usable. Moons must be **named** — `S/2003 J 12` is a
designation, not a name — and must orbit something a child has heard of, so the
moons of obscure trans-Neptunian objects are out. Numbers a child cannot picture
are replaced: a moon 868 times smaller than ours gets its real width in km
instead.

Planet facts go to Meet the Planets, moon facts to Moon Mission, rock facts to
Space Rocks, and all three to Amazing Space Facts.

## Generating sky and star facts

`src/content/space/wikiFacts.ts` holds 141 cards crawled from Simple English
Wikipedia categories. To refresh:

```bash
node scripts/gen-wiki-facts.mjs
```

This is the only source Sky Science, Deep Space and Sun and Stars have — no
solar system database explains why the sky is blue. Summaries are cached under
`.cache/` (gitignored), so a re-run with different filters costs nothing.

**Build time, not runtime.** Wikipedia 429s at better than one request a second
and this crawl takes minutes with backoff; a child opening a mission must never
wait on that.

Four gates stand between a category and a card, because **readable is not the
same as worth knowing** — the readability filter happily passed a free-electron
laser into Sky Science:

1. **Title gate**, before spending a fetch — digits, `List of...`, single proper
   nouns outside a core-concept list, variable-star designations (`AG Carinae`),
   stars named after their discoverer.
2. **Readability**, shared with the runtime engine via `kidFilters.json`.
3. **Relevance**, per section — `Category:Light` is a physics-lab category.
4. **Emptiness** — fifteen nebula pages whose entire card was a distance in
   light-years, and astronaut pages that are interchangeable biography openers.

What no rule catches is named explicitly in `REJECT`. That list is the honest
part: when a rule cannot express "a six-year-old does not need this", somebody
has to sign off on a name.

## Flags and country data

Flags mode covers **every UN member state** (194). Flag artwork comes from
[flagcdn.com](https://flagcdn.com) as SVG — keyless, CORS-open, and sharp at any
size, so nobody has to draw a flag.

Difficulty picks the pool: **Easy** is 55 countries a child is likely to have
heard of, **Medium** opens it to all 194. The two rotate separately, so a lap of
Easy does not eat into Medium.

The country list itself (`src/content/worldCountries.ts`) is **generated and
committed**, not fetched:

```bash
node scripts/gen-countries.mjs
```

Source is [mledoze/countries](https://github.com/mledoze/countries), the dataset
REST Countries is itself built on. Names, ISO codes and capitals change about
once a decade, so fetching them at runtime buys nothing and costs an outage
every time an API deprecates a version — REST Countries v3.1 now returns an
error and v5 requires an API key, which a browser-only app cannot keep secret
anyway (`VITE_*` values are inlined into the bundle).

Nothing in this game is hand-written content any more. The reveal card shows
continent, subregion and capital from the generated data, then trivia fetched
from **Simple English Wikipedia** at reveal time — the country page for what it
is known for, and `Flag of X` for what the colours mean. Results are cached in
`localStorage`, and a country with nothing usable just shows its capital.

Two filters sit in front of that text (`src/content/countryFacts.ts`). The
readability filter is the one the space cards use, relaxed so a country's own
name can exceed the word-length cap — otherwise "Liechtenstein is a country in
Europe." gets thrown away. The second drops sentences a six-year-old does not
need on a reward screen: encyclopedias are neutral, not age-graded, so the same
paragraph that names a capital will name an invasion.

Maps mode still runs on twelve countries: board membership is a design choice
(four per continent) that `scripts/gen-map-paths.mjs` draws to match.

## Space Explorer content, and how it stays fresh

Space Explorer has two doors: **Learn** (illustrated fact cards per mission) and
**Quiz** (picture-choice questions with a gentle correction). Nobody has to edit
content daily — four layers keep it moving:

| Layer | Where | Brings new content |
|-------|-------|--------------------|
| Curated missions | `src/content/space.ts` | the teaching core, always shown |
| Fact bank | `src/content/spaceFacts.ts` | rotates by "not seen yet", offline |
| Fact engine | `src/content/factEngine.ts` + `spaceTopics.ts` | new cards every visit |
| Live data | `src/content/spaceLive.ts` | today's sky, when online |

### The fact engine

`factEngine.ts` turns an encyclopedia summary into a kid card — art, title, one
or two short lines. The source is **Simple English Wikipedia**, the one
encyclopedia already written at a basic reading level ("A comet is a ball of
mostly ice that moves around in outer space").

Its output still goes through a readability filter, because plenty of its
sentences carry grown-up baggage. The filter drops a sentence that has jargon
(`astronomical unit`, `ultraviolet`, `eccentricity`, …), leftover brackets or
semicolons, 5-digit numbers, unit soup, a word over 12 letters, or more than 20
words. Art is chosen by keyword (`saturn|titan|ring` → the Saturn drawing). If
nothing in a summary survives, the card is dropped rather than shown — a card is
never half-understandable.

**To add content, add one line** to `MISSION_TOPICS` in `spaceTopics.ts`:

```ts
{ title: 'Ganymede', page: 'Ganymede (moon)', art: 'jupiter' }
```

That is a new card in that mission for ever, with no wording to write.

### Rotation

`src/content/seen.ts` remembers what this browser has been shown (topics, facts,
cards) in `localStorage`. Every pick asks for **unseen first, then longest-ago**,
so nothing repeats while anything new is left, and the pool still cycles once
it has all been seen. Skipping a week no longer skips content the way a pure
date rotation did.

### Live data (🛰️ Today in Space)

All keyless, all CORS-enabled from the browser, each with a 4.5s timeout, cached
for the calendar day, skipped individually if it fails:

| Data | Endpoint |
|------|----------|
| People in space right now | `corquaid.github.io/international-space-station-APIs` |
| ISS altitude and speed | `api.wheretheiss.at/v1/satellites/25544` |
| Next rocket launch | `ll.thespacedevs.com/2.3.0/launches/upcoming/` |

Moon phase is *computed* from the date — no API beats arithmetic for something
that predictable.

Rule for anything live: **we read numbers and names, and write the sentence
ourselves.** No API prose is ever shown to a child, except through the engine's
filter above.

Also surveyed and not used (yet):

- **NASA APOD** (`api.nasa.gov/planetary/apod`) — a real photo every day, and
  the obvious next addition. Needs a free API key, and its explanation is
  written for adults, so only the image and title are usable.
- **NASA Image Library** (`images-api.nasa.gov`) — keyless photo search, useful
  for putting real Saturn/galaxy photos next to the drawings.
- **English Wikipedia REST** — accurate, but adult reading level; Simple English
  is the same API with a kid-level corpus.
- **api.le-systeme-solaire.net** — planet numbers; now requires a key.

## Deploy on Vercel

1. Push this repo to GitHub (`akira-games-hub`).
2. In [Vercel](https://vercel.com): **Add New Project** → import `akira-games-hub` → Deploy (Vite is auto-detected).
3. Open the Vercel URL — the site is public, no password.
