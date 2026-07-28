/**
 * Real photographs for the things you can point a telescope at.
 *
 * A drawing is right for an idea — why the sky is blue, how phases work, what
 * the far side gets. It is not right for Jupiter, which we have actual pictures
 * of. So only the object kinds appear below; anything missing keeps its
 * illustration, and that is deliberate rather than unfinished.
 *
 * Source is the Wikipedia lead image, which beats searching NASA's library:
 * NASA's top hit for "Jupiter planet" is a photo of a launch vehicle, because
 * it matches the Jupiter rocket. The lead image of an article about Jupiter is
 * always Jupiter.
 */
import type { SpaceArtKind } from './SpaceArt'

const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const TIMEOUT_MS = 4500
const CACHE_KEY = 'space-photos-v1'

/** Art kind to the Wikipedia article whose lead image shows that thing. */
const PHOTO_PAGES: Partial<Record<SpaceArtKind, string>> = {
  sun: 'Sun',
  mercury: 'Mercury (planet)',
  venus: 'Venus',
  earth: 'Earth',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  moon: 'Moon',
  craters: 'Tycho (lunar crater)',
  galaxy: 'Whirlpool Galaxy',
  'milky-way': 'Milky Way',
  comet: "Halley's Comet",
  meteor: 'Perseids',
  meteorite: 'Meteorite',
  volcano: 'Olympus Mons',
  telescope: 'Hubble Space Telescope',
  astronaut: 'Buzz Aldrin',
  rocket: 'Saturn V',
  stars: 'Pleiades',
}

export function hasPhoto(kind: SpaceArtKind): boolean {
  return kind in PHOTO_PAGES
}

type Cache = Record<string, string>

function readCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return parsed && typeof parsed === 'object' ? (parsed as Cache) : {}
  } catch {
    return {}
  }
}

/**
 * The photo for an art kind, or null to keep the drawing. Results are cached in
 * localStorage — these images do not change, and the card should not wait on a
 * round trip every time it is shown.
 */
export async function loadSpacePhoto(
  kind: SpaceArtKind,
): Promise<string | null> {
  const page = PHOTO_PAGES[kind]
  if (!page) return null

  const cache = readCache()
  if (cache[kind]) return cache[kind]

  try {
    const res = await fetch(`${WIKI}${encodeURIComponent(page)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { thumbnail?: { source?: string } }
    const src = data.thumbnail?.source
    if (!src) return null
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, [kind]: src }))
    } catch {
      // private mode or full — we just refetch next time
    }
    return src
  } catch {
    return null
  }
}
