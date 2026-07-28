/**
 * What this browser has already been shown, so the next visit brings something
 * new. Keys are stable strings (a topic name, a fact's first words).
 */
const KEY = 'space-seen-v1'
const LIMIT = 600

type SeenMap = Record<string, number>

function read(): SeenMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as SeenMap) : {}
  } catch {
    return {}
  }
}

function write(map: SeenMap): void {
  try {
    const entries = Object.entries(map)
    // keep the most recent keys only, so storage cannot grow for ever
    const trimmed = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, LIMIT)
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)))
  } catch {
    // private mode — rotation just restarts next visit
  }
}

/**
 * `at` is an ordering token that is normally the clock. Left unset it always
 * lands after everything already stored: Date.now() repeats inside the same
 * millisecond, and two items marked in one tick would otherwise tie and the
 * rotation would collapse — which is what a fast tapper, or a loop marking a
 * batch of cards, actually does.
 */
export function markSeen(key: string, at?: number): void {
  const map = read()
  map[key] = at ?? Math.max(Date.now(), ...Object.values(map).map((n) => n + 1))
  write(map)
}

export function seenAt(key: string): number | undefined {
  return read()[key]
}

/**
 * Unseen items first; once everything has been seen, the ones seen longest ago.
 * That way the pool keeps turning over instead of stopping.
 */
export function pickFresh<T>(
  items: T[],
  count: number,
  key: (item: T) => string,
): T[] {
  const map = read()
  const ranked = items
    .map((item, index) => ({
      item,
      index,
      seen: map[key(item)] ?? 0,
    }))
    .sort((a, b) => a.seen - b.seen || a.index - b.index)
  return ranked.slice(0, count).map((r) => r.item)
}

/** Items never shown yet, in list order. */
export function unseen<T>(items: T[], key: (item: T) => string): T[] {
  const map = read()
  return items.filter((item) => !map[key(item)])
}

export function clearSeen(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to do
  }
}
