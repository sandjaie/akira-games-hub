# Space Explorer: Facts at Scale

**Goal:** Enough space facts that a child playing ~10 cards a week never hits a
repeat for years. The bar is comprehension by a five- to ten-year-old, not the
count. Quiz draws from every fact in the app, endlessly, with no section of its
own.

**Where we are:** 113 generated facts + 31 curated cards + 84 hand-typed
Wikipedia topics.

---

## The honest arithmetic first

**1000 per section is not reachable, and the reason matters.** The sections are
not the same size as subjects. Measured ceilings from the sources we have:

| Source | Have key? | Yield | Feeds |
|---|---|---|---|
| Solar System OpenData | yes | ~900 facts (see below) | planets, moon, space-rocks, wow-facts |
| Simple Wikipedia traversal | keyless | ~25% of pages, ~2 sentences each | every section, especially narrative ones |
| NASA APOD archive | DEMO_KEY | ~11,000 entries, adult prose | images; facts only after heavy filtering |

Solar System OpenData breakdown, counted from the live response:

- 12 planets and dwarf planets × ~7 templates = **~84**
- 205 properly named moons (203 have a discoverer, 179 a radius) × ~3 = **~500**
- ~18 named asteroids and comets × 2 = **~36**
- **Comparisons between bodies** — the unlock we have not used. 12 planets makes
  66 pairs; at ~4 templates that is **~264** more, and they are the good kind:
  "You would weigh six times more on Jupiter than on Mars."
- Computed superlatives (fastest, coldest, most moons) = **~20**

That is **~900 from one source** — but nearly all of it is planets and moons.

**Sky Science cannot reach 1000 and padding it would be dishonest.** There are
not a thousand kid-level facts about why the sky is blue. The subject is small.
Realistic ceiling is 100–200, and only by widening the section to cover light,
colour, weather, seasons and day/night. That is a good section at 150. It is a
bad section at 1000, because everything after ~200 is filler or off-topic.

### Realistic per-section targets

| Section | Target | Where it comes from |
|---|---|---|
| Meet the Planets | 400 | solar system data + comparisons |
| Moon Mission | 350 | 205 named moons, discovery, size |
| Amazing Space Facts | 900 | draws from every generated pool |
| Space Rocks | 150 | asteroids, comets, meteor Wikipedia pages |
| Sun and Stars | 200 | Wikipedia traversal + a star catalogue |
| Deep Space | 200 | Wikipedia traversal (galaxies, nebulae) |
| Sky Science | 150 | Wikipedia traversal + curated; **subject-limited** |
| Today in Space | live | already fetched at runtime |

**Total ~1400 distinct facts.** At 10 cards a week that is over two years before
a repeat, and Amazing Space Facts alone carries 900.

---

## Phase 1 — Mine the source we already have (~800 facts)

Extends `scripts/gen-space-facts.mjs`. No new dependency, no new key.

- [ ] Include all 205 properly named moons, not just radius ≥ 200km. Filter on
      the **name**, not the size: reject `S/2003 J 12` and anything starting
      with a digit. Size was the wrong proxy — it threw away named moons and
      kept nothing useful.
- [ ] Add named asteroids and comets (Arrokoth, Ryugu, Psyche, Halley,
      Hyakutake, NEOWISE, Shoemaker-Levy 9).
- [ ] **Comparison templates** between any two bodies — weight, width, year
      length, moon count, temperature. Guard against comparing a body with
      itself and against pairs where either field is missing.
- [ ] **Superlative templates** computed across the set: biggest, smallest,
      fastest year, longest day, most moons, coldest, hottest.
- [ ] Keep the interleave. With comparisons added, group by template *and* by
      body so a kid never gets three Jupiter cards running.

## Phase 2 — Wikipedia traversal, generated at build time (~400 facts)

New `scripts/gen-wiki-facts.mjs`. This is the only source for Sky Science, Deep
Space and Sun and Stars, which have no numbers to template from.

- [ ] Walk `list=categormembers` for a curated list of categories per section.
      Keyless, CORS-open, verified working.
- [ ] **Title gate before spending a fetch:** reject titles containing digits,
      catalogue binomials (`19 Ursae Minoris`), and disambiguation suffixes.
      Measured without it, `Category:Stars` is mostly catalogue entries.
- [ ] Run surviving pages through the existing `isKidReadable` filter plus the
      `NOT_FOR_KIDS` filter written for countries.
- [ ] **Generate at build time, commit the output.** Not runtime — I hit HTTP
      429 from Wikipedia while testing this, and a child opening a mission must
      not wait on a rate-limited crawl.
- [ ] Cache the rejects too, so a re-run does not refetch known-bad pages.

Expect ~25% of fetched pages to produce a usable card. Budget the crawl
accordingly and log what was dropped.

## Phase 3 — The quality gate (this is where the agent belongs)

I said earlier that an agent had no place here. That was right for *generating*
facts and wrong for *reviewing* them. At 1400 facts nobody will read them all,
and no regex can judge "would a six-year-old understand this and care".

- [ ] After each regeneration, an LLM pass reads the generated file and flags
      each fact: **keep / dull / confusing / wrong level / inappropriate**.
- [ ] Output is a committed `rejects.json`, not a rewrite. The model never
      writes a fact — it only votes on facts the templates produced. That keeps
      hallucination out of a child's science while still getting judgement.
- [ ] Human approves the diff before it ships.
- [ ] Run it on regeneration, not on a schedule — the solar system does not
      change weekly.

## Phase 4 — Quiz from everything

- [ ] Drop the per-mission quiz pools. Questions come from the whole fact set.
- [ ] Generated facts carry their own question, because we know the answer —
      we computed it. "Neptune takes 165 Earth years" becomes "Which planet
      takes 165 Earth years to go round the Sun?" with sibling planets as
      distractors. Mechanical and correct by construction.
- [ ] Endless: keep asking until she stops, same as Know the Countries.
- [ ] Rotate with the existing `seen` module so questions do not repeat either.

---

## Constraints that carry over

- **Numbers from the API, sentences from us.** The rule `spaceLive.ts` already
  sets. Every fact is phrased by a template so reading level is guaranteed.
- **Templates check before they speak.** The source has no temperature for
  Mercury, no radius for Haumea.
- **Keys never reach the browser.** `SSO_KEY` is read at generation time only. A
  bearer token in a Vite bundle is readable in devtools.
- **Concepts stay drawn and stay curated.** Phase 2 must not overwrite the
  hand-written cards that teach *why*; it adds alongside them.

## Order

Phase 1 first — it is the largest single win, needs nothing new, and lands
~800 facts. Phase 2 next, because Sky Science and Deep Space cannot grow
without it. Phase 3 once the pool is too big to eyeball. Phase 4 last.
