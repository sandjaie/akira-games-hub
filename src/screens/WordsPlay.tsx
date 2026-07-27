import { useEffect, useRef, useState } from 'react'
import { Rainbow } from '../components/Rainbow'
import { getWordLevel, type WordLevelId } from '../content/wordLevels'
import {
  completeWordLevel,
  recordTypedWord,
} from '../progress/progress'
import type { WordsProgress } from '../types'
import {
  createTypingState,
  isWordComplete,
  reduceTyping,
  type TypingState,
} from '../words/typing'

const LETTER_ROWS = [
  { id: 'row1', keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
  { id: 'row2', keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
  { id: 'row3', keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'] },
] as const

type Props = {
  levelId: WordLevelId
  words: WordsProgress
  onWordsChange: (words: WordsProgress) => void
  onBack: () => void
  onLevelComplete: () => void
}

export function WordsPlay({
  levelId,
  words,
  onWordsChange,
  onBack,
  onLevelComplete,
}: Props) {
  const level = getWordLevel(levelId)
  const [wordIndex, setWordIndex] = useState(0)
  const [typing, setTyping] = useState<TypingState>(() =>
    createTypingState(level.words[0]),
  )
  const [dropKey, setDropKey] = useState(0)
  const [wordDone, setWordDone] = useState(false)
  const wordsRef = useRef(words)
  wordsRef.current = words

  function pressKey(key: string) {
    if (wordDone) return
    setTyping((s) => reduceTyping(s, { type: 'KEY', key }))
  }

  function pressBackspace() {
    if (wordDone) return
    setTyping((s) => reduceTyping(s, { type: 'BACKSPACE' }))
  }

  function advance(countWord: boolean) {
    let nextWords = wordsRef.current
    if (countWord) {
      nextWords = recordTypedWord(nextWords)
      onWordsChange(nextWords)
    }

    const nextIndex = wordIndex + 1
    if (nextIndex >= level.words.length) {
      onWordsChange(completeWordLevel(nextWords, levelId))
      onLevelComplete()
      return
    }
    setWordIndex(nextIndex)
    setTyping(createTypingState(level.words[nextIndex]))
    setDropKey((k) => k + 1)
    setWordDone(false)
  }

  function pressDone() {
    if (!isWordComplete(typing) && !wordDone) return
    advance(true)
  }

  function pressNext() {
    advance(wordDone || isWordComplete(typing))
  }

  useEffect(() => {
    if (!typing.wrong) return
    const id = window.setTimeout(() => {
      setTyping((s) => reduceTyping(s, { type: 'CLEAR_WRONG' }))
    }, 350)
    return () => window.clearTimeout(id)
  }, [typing.wrong])

  useEffect(() => {
    if (!isWordComplete(typing) || wordDone) return
    setWordDone(true)
  }, [typing, wordDone])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (wordDone || isWordComplete(typing)) {
          advance(true)
        }
        return
      }
      if (wordDone) return
      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyping((s) => reduceTyping(s, { type: 'BACKSPACE' }))
        return
      }
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        e.preventDefault()
        setTyping((s) => reduceTyping(s, { type: 'KEY', key: e.key }))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const done = typing.word.slice(0, typing.index)
  const current = typing.word[typing.index] ?? ''
  const todo = typing.word.slice(typing.index + 1)
  const canDone = wordDone || isWordComplete(typing)
  const isLast = wordIndex >= level.words.length - 1

  return (
    <main className="screen words-play">
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Themes
        </button>
        <p className="eyebrow">
          {level.emoji} {level.title}
        </p>
        <span className="words-top-spacer" />
      </div>
      <div className="play-stage">
        <div className="play-clouds" aria-hidden="true" />
        <Rainbow />
        <div className="drop-zone">
          <p
            key={dropKey}
            className={`falling-word${typing.wrong ? ' shake' : ''}${wordDone ? ' cheer-word' : ''}`}
            aria-live="polite"
          >
            <span className="done">{done}</span>
            {current ? <span className="current">{current}</span> : null}
            {todo ? <span className="todo">{todo}</span> : null}
          </p>
        </div>
        <p className="hint">
          {wordDone
            ? isLast
              ? 'Nice! Tap Done to finish the theme'
              : 'Nice! Tap Done or Next for the next word'
            : 'Tap the letters — or Next to skip'}
        </p>
        <p className="word-progress-count">
          Word {wordIndex + 1} of {level.words.length}
        </p>
        <div className="words-keyboard" aria-label="Letter keys">
          {LETTER_ROWS.map((row) => (
            <div key={row.id} className="words-key-row">
              {row.keys.map((key) =>
                key === '⌫' ? (
                  <button
                    key="backspace"
                    type="button"
                    className="words-key words-key-backspace"
                    disabled={wordDone}
                    onClick={pressBackspace}
                    aria-label="Backspace"
                  >
                    ⌫
                  </button>
                ) : (
                  <button
                    key={key}
                    type="button"
                    className="words-key"
                    disabled={wordDone}
                    onClick={() => pressKey(key)}
                  >
                    {key}
                  </button>
                ),
              )}
            </div>
          ))}
          <div className="words-key-row words-key-actions">
            <button
              type="button"
              className="words-key words-key-action words-key-next"
              onClick={pressNext}
            >
              {isLast ? 'Finish →' : 'Next →'}
            </button>
            <button
              type="button"
              className="words-key words-key-action words-key-done"
              disabled={!canDone}
              onClick={pressDone}
            >
              Done ✓
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
