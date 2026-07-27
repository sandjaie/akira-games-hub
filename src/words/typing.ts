export type TypingState = { word: string; index: number; wrong: boolean }

export type TypingEvent =
  | { type: 'KEY'; key: string }
  | { type: 'BACKSPACE' }
  | { type: 'CLEAR_WRONG' }
  | { type: 'RESET'; word: string }

export function createTypingState(word: string): TypingState {
  return { word: word.toUpperCase(), index: 0, wrong: false }
}

export function isWordComplete(state: TypingState): boolean {
  return state.index >= state.word.length
}

export function reduceTyping(state: TypingState, event: TypingEvent): TypingState {
  switch (event.type) {
    case 'RESET':
      return createTypingState(event.word)
    case 'CLEAR_WRONG':
      return { ...state, wrong: false }
    case 'BACKSPACE':
      return { ...state, index: Math.max(0, state.index - 1), wrong: false }
    case 'KEY': {
      if (isWordComplete(state)) return state
      if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return state
      const expected = state.word[state.index]
      if (event.key.toUpperCase() === expected) {
        return { ...state, index: state.index + 1, wrong: false }
      }
      return { ...state, wrong: true }
    }
  }
}
