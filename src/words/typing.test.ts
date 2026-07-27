import { describe, expect, it } from 'vitest'
import { createTypingState, isWordComplete, reduceTyping } from './typing'

describe('reduceTyping', () => {
  it('accepts correct letter case-insensitively', () => {
    let s = createTypingState('Cat')
    s = reduceTyping(s, { type: 'KEY', key: 'c' })
    expect(s.index).toBe(1)
    expect(s.wrong).toBe(false)
  })

  it('rejects wrong letter without advancing', () => {
    let s = createTypingState('CAT')
    s = reduceTyping(s, { type: 'KEY', key: 'x' })
    expect(s.index).toBe(0)
    expect(s.wrong).toBe(true)
  })

  it('backspaces one correct letter', () => {
    let s = createTypingState('CAT')
    s = reduceTyping(s, { type: 'KEY', key: 'c' })
    s = reduceTyping(s, { type: 'BACKSPACE' })
    expect(s.index).toBe(0)
  })

  it('completes the word', () => {
    let s = createTypingState('HI')
    s = reduceTyping(s, { type: 'KEY', key: 'h' })
    s = reduceTyping(s, { type: 'KEY', key: 'i' })
    expect(isWordComplete(s)).toBe(true)
  })
})
