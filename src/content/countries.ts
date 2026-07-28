/** Curated countries for Know the Countries (offline). */
import { WORLD_COUNTRIES } from './worldCountries'

export type Continent =
  | 'Asia'
  | 'Europe'
  | 'Africa'
  | 'North America'
  | 'South America'
  | 'Oceania'

export type MapBoardId =
  | 'asia-pacific'
  | 'europe'
  | 'africa'
  | 'americas'

export type CountryId =
  | 'india'
  | 'japan'
  | 'china'
  | 'australia'
  | 'egypt'
  | 'south-africa'
  | 'france'
  | 'italy'
  | 'united-kingdom'
  | 'canada'
  | 'united-states'
  | 'brazil'

/** Map-only hotspot used as a Medium distractor (never a question answer). */
export type MapOnlyRegionId = 'mexico' | 'nigeria' | 'kenya' | 'spain'

export type MapRegionId = CountryId | MapOnlyRegionId

export type Country = {
  id: CountryId
  name: string
  continent: Continent
  fact: string
  /** Visually similar flags in this set — preferred Medium distractors. */
  similarFlagIds: CountryId[]
  mapBoard: MapBoardId
}

export const ROUND_SIZE = 5

export const COUNTRY_ORDER: CountryId[] = [
  'india',
  'japan',
  'china',
  'australia',
  'egypt',
  'south-africa',
  'france',
  'italy',
  'united-kingdom',
  'canada',
  'united-states',
  'brazil',
]

export const COUNTRIES: Record<CountryId, Country> = {
  india: {
    id: 'india',
    name: 'India',
    continent: 'Asia',
    fact: 'India has a big spinning wheel on its flag called the Ashoka Chakra.',
    similarFlagIds: ['south-africa'],
    mapBoard: 'asia-pacific',
  },
  japan: {
    id: 'japan',
    name: 'Japan',
    continent: 'Asia',
    fact: 'Japan is made of many islands in the Pacific Ocean.',
    similarFlagIds: ['china'],
    mapBoard: 'asia-pacific',
  },
  china: {
    id: 'china',
    name: 'China',
    continent: 'Asia',
    fact: 'China’s flag has one big star and four little stars.',
    similarFlagIds: ['japan'],
    mapBoard: 'asia-pacific',
  },
  australia: {
    id: 'australia',
    name: 'Australia',
    continent: 'Oceania',
    fact: 'Australia is home to kangaroos and koalas.',
    similarFlagIds: ['united-kingdom'],
    mapBoard: 'asia-pacific',
  },
  egypt: {
    id: 'egypt',
    name: 'Egypt',
    continent: 'Africa',
    fact: 'Egypt is famous for the pyramids and the Nile River.',
    similarFlagIds: ['italy'],
    mapBoard: 'africa',
  },
  'south-africa': {
    id: 'south-africa',
    name: 'South Africa',
    continent: 'Africa',
    fact: 'South Africa’s flag uses many colors that stand for unity.',
    similarFlagIds: ['india'],
    mapBoard: 'africa',
  },
  france: {
    id: 'france',
    name: 'France',
    continent: 'Europe',
    fact: 'France is known for the Eiffel Tower in Paris.',
    similarFlagIds: ['italy', 'united-states'],
    mapBoard: 'europe',
  },
  italy: {
    id: 'italy',
    name: 'Italy',
    continent: 'Europe',
    fact: 'Italy looks a bit like a boot on the map.',
    similarFlagIds: ['france'],
    mapBoard: 'europe',
  },
  'united-kingdom': {
    id: 'united-kingdom',
    name: 'United Kingdom',
    continent: 'Europe',
    fact: 'The United Kingdom’s flag is called the Union Jack.',
    similarFlagIds: ['australia', 'united-states'],
    mapBoard: 'europe',
  },
  canada: {
    id: 'canada',
    name: 'Canada',
    continent: 'North America',
    fact: 'Canada’s flag has a red maple leaf in the middle.',
    similarFlagIds: ['united-states'],
    mapBoard: 'americas',
  },
  'united-states': {
    id: 'united-states',
    name: 'United States',
    continent: 'North America',
    fact: 'The United States flag is nicknamed the Stars and Stripes.',
    similarFlagIds: ['france', 'united-kingdom', 'canada'],
    mapBoard: 'americas',
  },
  brazil: {
    id: 'brazil',
    name: 'Brazil',
    continent: 'South America',
    fact: 'Brazil is home to a huge rainforest called the Amazon.',
    similarFlagIds: [],
    mapBoard: 'americas',
  },
}

export const MAP_BOARD_REGIONS: Record<MapBoardId, MapRegionId[]> = {
  'asia-pacific': ['india', 'china', 'japan', 'australia'],
  europe: ['united-kingdom', 'france', 'italy', 'spain'],
  africa: ['egypt', 'nigeria', 'kenya', 'south-africa'],
  americas: ['canada', 'united-states', 'mexico', 'brazil'],
}

export const MAP_ONLY_LABELS: Record<MapOnlyRegionId, string> = {
  mexico: 'Mexico',
  nigeria: 'Nigeria',
  kenya: 'Kenya',
  spain: 'Spain',
}

export function getCountry(id: CountryId): Country {
  return COUNTRIES[id]
}

export function regionLabel(id: MapRegionId): string {
  if (id in COUNTRIES) return COUNTRIES[id as CountryId].name
  return MAP_ONLY_LABELS[id as MapOnlyRegionId]
}

export function isCountryId(id: string): id is CountryId {
  return COUNTRY_ORDER.includes(id as CountryId)
}

/* ---------------------------------------------------------------------------
 * The wide flag pool.
 *
 * Flags mode draws from every UN member state; maps mode stays on the curated
 * twelve, because each map board and its hotspots are hand-drawn. Ids are ISO
 * codes out here and slugs for the curated set, so getInfo resolves both.
 * ------------------------------------------------------------------------- */

/** ISO code for each curated country, so its flag can come from the CDN too. */
export const CURATED_CODES: Record<CountryId, string> = {
  india: 'in',
  japan: 'jp',
  china: 'cn',
  australia: 'au',
  egypt: 'eg',
  'south-africa': 'za',
  france: 'fr',
  italy: 'it',
  'united-kingdom': 'gb',
  canada: 'ca',
  'united-states': 'us',
  brazil: 'br',
}

export type CountryInfo = {
  code: string
  name: string
  continent: Continent
  fact: string
}

const WORLD_BY_CODE = new Map(WORLD_COUNTRIES.map((c) => [c.code, c]))

/** flagcdn is keyless and CORS-open, and serves SVG so it stays sharp. */
export function flagUrl(code: string): string {
  return `https://flagcdn.com/${code}.svg`
}

/**
 * What the play screen shows, for a curated slug or a plain ISO code. Curated
 * countries keep their hand-written fact; the rest get their capital, which is
 * always true and always reads at the right level.
 */
export function getInfo(id: string): CountryInfo {
  // maps pass a slug, flags pass an ISO code — both must find the curated entry,
  // or the twelve hand-written facts go dead in flags mode
  const curatedId = id in COUNTRIES ? (id as CountryId) : curatedIdForCode(id)
  const curated = curatedId ? COUNTRIES[curatedId] : undefined
  if (curated) {
    return {
      code: CURATED_CODES[curated.id],
      name: curated.name,
      continent: curated.continent,
      fact: curated.fact,
    }
  }
  const world = WORLD_BY_CODE.get(id)
  if (world) {
    return {
      code: world.code,
      name: world.name,
      continent: world.continent,
      fact: `${world.capital} is the capital of ${world.name}.`,
    }
  }
  return { code: id, name: regionLabel(id as MapRegionId) ?? id, continent: 'Asia', fact: '' }
}

/** Easy keeps to countries a child is likely to know; Medium opens it up. */
export function flagPool(difficulty: 'easy' | 'medium'): string[] {
  const rows =
    difficulty === 'easy'
      ? WORLD_COUNTRIES.filter((c) => c.tier === 1)
      : WORLD_COUNTRIES
  return rows.map((c) => c.code)
}

export function continentOfCode(code: string): Continent | undefined {
  return WORLD_BY_CODE.get(code)?.continent
}

/** The hand-drawn flag for a code, when there is one — the offline fallback. */
export function curatedIdForCode(code: string): CountryId | undefined {
  return COUNTRY_ORDER.find((id) => CURATED_CODES[id] === code)
}
