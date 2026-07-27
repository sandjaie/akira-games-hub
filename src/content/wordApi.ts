/** Kid-safe filters + Datamuse live word fetching with offline fallback. */

const DATAMUSE = 'https://api.datamuse.com/words'
const RECENT_KEY = 'akira-recent-words'
const RECENT_LIMIT = 80

/** Very small blocklist for accidental adult/harsh dictionary hits. */
const BLOCKLIST = new Set(
  [
    'ass',
    'sex',
    'die',
    'dead',
    'kill',
    'gun',
    'war',
    'hate',
    'hell',
    'damn',
    'drug',
    'wine',
    'beer',
    'rum',
    'vodka',
    'porn',
    'nude',
  ].map((w) => w.toUpperCase()),
)

export type LengthRange = { min: number; max: number }

export function normalizeWord(raw: string): string | null {
  const word = raw.trim().toUpperCase()
  if (!/^[A-Z]+$/.test(word)) return null
  if (BLOCKLIST.has(word)) return null
  return word
}

export function filterKidWords(
  candidates: string[],
  range: LengthRange,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of candidates) {
    const word = normalizeWord(raw)
    if (!word) continue
    if (word.length < range.min || word.length > range.max) continue
    if (seen.has(word)) continue
    seen.add(word)
    out.push(word)
  }
  return out
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function readRecentWords(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((w): w is string => typeof w === 'string')
  } catch {
    return []
  }
}

export function rememberWords(words: string[]): void {
  try {
    const merged = [...words.map((w) => w.toUpperCase()), ...readRecentWords()]
    const unique = [...new Set(merged)].slice(0, RECENT_LIMIT)
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(unique))
  } catch {
    // ignore quota / private mode
  }
}

/** Prefer words not seen recently this browser tab session. */
export function preferFresh(words: string[], count: number): string[] {
  const recent = new Set(readRecentWords())
  const fresh = words.filter((w) => !recent.has(w))
  const pool = fresh.length >= count ? fresh : words
  const picked = shuffle(pool).slice(0, count)
  rememberWords(picked)
  return picked
}

type DatamuseRow = { word?: string }

export async function fetchDatamuse(
  params: Record<string, string>,
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
  const url = new URL(DATAMUSE)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('max', params.max ?? '100')
  const res = await fetchImpl(url.toString())
  if (!res.ok) throw new Error(`Datamuse ${res.status}`)
  const data = (await res.json()) as DatamuseRow[]
  return data.map((row) => row.word ?? '').filter(Boolean)
}

export type ThemeQuery = {
  /** Datamuse “means like” */
  ml: string
  /** Optional topics hint */
  topics?: string
}

export async function fetchThemeWordList(
  query: ThemeQuery,
  range: LengthRange,
  count: number,
  fallback: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
  try {
    const raw = await fetchDatamuse(
      {
        ml: query.ml,
        ...(query.topics ? { topics: query.topics } : {}),
        md: 'p',
        max: '120',
      },
      fetchImpl,
    )
    const filtered = filterKidWords(raw, range)
    if (filtered.length < Math.min(5, count)) {
      return preferFresh(filterKidWords(fallback, range), count)
    }
    return preferFresh(filtered, count)
  } catch {
    return preferFresh(filterKidWords(fallback, range), count)
  }
}
