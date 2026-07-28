/** Kid-safe word filters + "not seen recently" picking. */

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

/** A word plus the one-line kid explanation shown under it (when we have one). */
export type WordEntry = { word: string; hint?: string }

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

/** Prefer items not seen recently this browser tab session. */
export function preferFresh<T>(
  items: T[],
  count: number,
  key: (item: T) => string = (item) => String(item),
): T[] {
  const recent = new Set(readRecentWords())
  const fresh = items.filter((item) => !recent.has(key(item).toUpperCase()))
  const pool = fresh.length >= count ? fresh : items
  const picked = shuffle(pool).slice(0, count)
  rememberWords(picked.map(key))
  return picked
}
