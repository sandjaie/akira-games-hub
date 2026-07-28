import { afterEach, describe, expect, it } from 'vitest'
import { clearSeen, markSeen, pickFresh } from './seen'

const items = ['a', 'b', 'c', 'd']
const key = (s: string) => s

afterEach(() => {
  clearSeen()
})

describe('seen rotation', () => {
  it('shows unseen items first', () => {
    markSeen('a', 1000)
    markSeen('b', 2000)
    expect(pickFresh(items, 2, key)).toEqual(['c', 'd'])
  })

  it('comes back to the longest-ago once everything is seen', () => {
    markSeen('a', 4000)
    markSeen('b', 1000)
    markSeen('c', 3000)
    markSeen('d', 2000)
    expect(pickFresh(items, 2, key)).toEqual(['b', 'd'])
  })

  it('keeps list order for items never seen', () => {
    expect(pickFresh(items, 3, key)).toEqual(['a', 'b', 'c'])
  })

  it('marking again moves an item to the back of the queue', () => {
    const first = pickFresh(items, 1, key)[0]
    markSeen(first)
    expect(pickFresh(items, 1, key)[0]).not.toBe(first)
  })
})
