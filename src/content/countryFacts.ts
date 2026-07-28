/**
 * Trivia for the reveal card, read from Simple English Wikipedia.
 *
 * Two pages per country: the country itself, and "Flag of X" for what the
 * colours mean. Sentences go through the same readability filter the space
 * cards use, so nothing arrives written for grown-ups.
 *
 * Everything here is optional. Offline, or when a page has nothing usable, the
 * card still shows continent and capital from the baked-in data.
 */
import { isKidReadable, splitSentences } from './factEngine'

const WIKI = 'https://simple.wikipedia.org/api/rest_v1/page/summary/'
const TIMEOUT_MS = 4500
const CACHE_KEY = 'country-facts-v1'
/** Two, plus the flag line. More than three and the reward card is homework. */
const MAX_LINES = 2

export type CountryFacts = {
  /** What the country is known for. */
  about: string[]
  /** What its flag looks like or means, when the flag page says something. */
  flag?: string
}

type Cache = Record<string, CountryFacts>

function readCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return parsed && typeof parsed === 'object' ? (parsed as Cache) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // private mode, or full — we just refetch next time
  }
}

async function summary(page: string): Promise<string | null> {
  try {
    const res = await fetch(`${WIKI}${encodeURIComponent(page)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { extract?: string; type?: string }
    // disambiguation pages read like an index, never like a fact
    if (data.type && data.type !== 'standard') return null
    return data.extract ?? null
  } catch {
    return null
  }
}

/**
 * Country pages carry a lot a six-year-old does not need on a reward screen.
 * Encyclopedias are neutral, not age-graded: the same paragraph that names a
 * capital will name an invasion. This drops the sentence, not the country.
 */
const NOT_FOR_KIDS =
  /\b(war|wars|invad|invasion|genocide|massacre|killed|deaths?|dead|famine|slaver?y|slaves?|dictator|regime|coup|terroris|refugee|weapon|nuclear|army|armies|military|troops|conflict|rebel|execut|assassinat|colonial|colonis|coloniz|empire|beer|wine|alcohol|drugs?|crime|prison|poverty|disease|epidemic|pandemic)/i

/** Readable sentences, minus the ones that only restate what the card shows. */
export function usableLines(
  extract: string,
  name: string,
  capital: string,
  limit = MAX_LINES,
): string[] {
  const restatesCard = new RegExp(
    `\\bcapital\\b.*\\b${capital}\\b|\\b${capital}\\b.*\\bcapital\\b`,
    'i',
  )
  return splitSentences(extract)
    .filter((s) => isKidReadable(s, [name, capital]))
    .filter((s) => !NOT_FOR_KIDS.test(s))
    .filter((s) => !capital || !restatesCard.test(s))
    .slice(0, limit)
}

export async function loadCountryFacts(
  code: string,
  name: string,
  capital: string,
): Promise<CountryFacts> {
  const cache = readCache()
  const hit = cache[code]
  if (hit) return hit

  const [about, flag] = await Promise.all([
    summary(name),
    summary(`Flag of ${name}`),
  ])

  const facts: CountryFacts = {
    about: about ? usableLines(about, name, capital) : [],
    flag: flag ? usableLines(flag, name, capital, 1)[0] : undefined,
  }

  // only cache something worth having, so a flaky call can be retried
  if (facts.about.length > 0 || facts.flag) {
    writeCache({ ...cache, [code]: facts })
  }
  return facts
}
