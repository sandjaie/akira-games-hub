/** Who is playing right now. Akira made the site; friends type their own name. */
export const MAKER_NAME = 'Akira'

export const NAME_MAX_LENGTH = 14

const KEY = 'cla-player-name'

export function cleanPlayerName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LENGTH)
}

export function loadPlayerName(): string {
  try {
    return cleanPlayerName(localStorage.getItem(KEY) ?? '')
  } catch {
    return ''
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(KEY, cleanPlayerName(name))
  } catch {
    // private browsing — the name just won't stick between visits
  }
}
