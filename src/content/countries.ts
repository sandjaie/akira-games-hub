/**
 * Know the Countries reference data.
 *
 * Nothing here is hand-written content any more. Names, continents, subregions
 * and capitals all come from `worldCountries.ts`, which is generated from
 * mledoze/countries; flags come from flagcdn by ISO code; trivia comes from
 * Simple English Wikipedia at reveal time (`countryFacts.ts`).
 *
 * What remains is board configuration for maps mode: which four countries each
 * continent board shows. That is a design choice, not data — the same four are
 * drawn by scripts/gen-map-paths.mjs, so the two must agree.
 */
import { WORLD_COUNTRIES } from './worldCountries'

export type Continent =
  | 'Asia'
  | 'Europe'
  | 'Africa'
  | 'North America'
  | 'South America'
  | 'Oceania'

export type MapBoardId = 'asia-pacific' | 'europe' | 'africa' | 'americas'

/** Countries a map board can ask about. */
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

export const MAP_BOARD_OF: Record<CountryId, MapBoardId> = {
  india: 'asia-pacific',
  japan: 'asia-pacific',
  china: 'asia-pacific',
  australia: 'asia-pacific',
  egypt: 'africa',
  'south-africa': 'africa',
  france: 'europe',
  italy: 'europe',
  'united-kingdom': 'europe',
  canada: 'americas',
  'united-states': 'americas',
  brazil: 'americas',
}

export const MAP_BOARD_REGIONS: Record<MapBoardId, MapRegionId[]> = {
  'asia-pacific': ['india', 'china', 'japan', 'australia'],
  europe: ['united-kingdom', 'france', 'italy', 'spain'],
  africa: ['egypt', 'nigeria', 'kenya', 'south-africa'],
  americas: ['canada', 'united-states', 'mexico', 'brazil'],
}

/** Slug to ISO code, for every region a map board can show. */
export const SLUG_CODES: Record<string, string> = {
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
  mexico: 'mx',
  nigeria: 'ng',
  kenya: 'ke',
  spain: 'es',
}

export type CountryInfo = {
  code: string
  name: string
  continent: Continent
  subregion: string
  capital: string
}

const WORLD_BY_CODE = new Map(WORLD_COUNTRIES.map((c) => [c.code, c]))

/** flagcdn is keyless and CORS-open, and serves SVG so it stays sharp. */
export function flagUrl(code: string): string {
  return `https://flagcdn.com/${code}.svg`
}

/** Maps pass a slug, flags pass an ISO code — both resolve to the same row. */
export function getInfo(id: string): CountryInfo {
  const code = SLUG_CODES[id] ?? id
  const world = WORLD_BY_CODE.get(code)
  if (!world) {
    return { code, name: id, continent: 'Europe', subregion: '', capital: '' }
  }
  return {
    code,
    name: world.name,
    continent: world.continent,
    subregion: world.subregion,
    capital: world.capital,
  }
}

export function regionLabel(id: MapRegionId): string {
  return getInfo(id).name
}

export function isMapCountry(id: string): id is CountryId {
  return COUNTRY_ORDER.includes(id as CountryId)
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
