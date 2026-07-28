import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTodayCards } from './spaceLive'

const NOW = new Date('2026-07-28T09:00:00Z')

function stubFetch(handler: (url: string) => unknown) {
  vi.stubGlobal('fetch', (url: string) => {
    const body = handler(String(url))
    if (body === null) return Promise.reject(new Error('offline'))
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('today in space', () => {
  it('writes its own kid sentences from the live numbers', async () => {
    stubFetch((url) => {
      if (url.includes('people-in-space')) {
        return { number: 3, people: [{ craft: 'ISS' }, { craft: 'ISS' }] }
      }
      if (url.includes('wheretheiss')) return { altitude: 421.7, velocity: 27563 }
      if (url.includes('thespacedevs')) {
        return {
          results: [
            { name: 'Falcon 9 Block 5 | Starlink 12-7', net: '2026-07-29T10:00:00Z' },
          ],
        }
      }
      return null
    })

    const cards = await loadTodayCards(NOW)
    const text = cards.map((c) => `${c.title} ${c.lines.join(' ')}`).join('\n')

    expect(text).toContain('3 people are in space right now')
    expect(text).toContain('422 km above the ground')
    expect(text).toContain('27,600 km/h')
    // rocket name only — never the API's own prose
    expect(text).toContain('Next rocket up: Falcon 9 Block 5')
    expect(text).not.toContain('Starlink 12-7')
    expect(text).toContain('tomorrow')
  })

  it('still teaches when every API is down', async () => {
    stubFetch(() => null)
    const cards = await loadTodayCards(NOW)
    expect(cards.length).toBeGreaterThanOrEqual(4)
    expect(cards[0].title).toContain('Tonight the Moon is a')
    expect(cards.map((c) => c.title)).not.toContain(
      'The space station is flying right now',
    )
  })

  it('rotates the daily facts instead of repeating them', async () => {
    stubFetch(() => null)
    const first = await loadTodayCards(NOW)
    localStorage.removeItem('space-today-v1')
    const second = await loadTodayCards(NOW)
    const firstFacts = first.slice(1).map((c) => c.lines[0])
    const secondFacts = second.slice(1).map((c) => c.lines[0])
    expect(secondFacts).not.toEqual(firstFacts)
    expect(secondFacts.some((f) => firstFacts.includes(f))).toBe(false)
  })

  it('skips a single broken source instead of the whole card set', async () => {
    stubFetch((url) =>
      url.includes('wheretheiss') ? { number: 7 } : url.includes('people-in-space')
        ? { number: 7, people: [] }
        : null,
    )
    const cards = await loadTodayCards(NOW)
    const titles = cards.map((c) => c.title).join(' ')
    expect(titles).toContain('7 people are in space right now')
    expect(titles).not.toContain('space station is flying')
  })

  it('serves the same cards again on the same day, from cache', async () => {
    let calls = 0
    stubFetch((url) => {
      calls += 1
      return url.includes('people-in-space') ? { number: 4, people: [] } : null
    })
    const first = await loadTodayCards(NOW)
    const callsAfterFirst = calls
    const second = await loadTodayCards(NOW)
    expect(second).toEqual(first)
    expect(calls).toBe(callsAfterFirst)
  })
})
