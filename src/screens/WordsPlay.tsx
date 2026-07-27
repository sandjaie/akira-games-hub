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

const LETTER_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const

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
  const [cheering, setCheering] = useState(false)
  const wordsRef = useRef(words)
  wordsRef.current = words
  const finishingRef = useRef(false)

  function pressKey(key: string) {
    if (cheering) return
    setTyping((s) => reduceTyping(s, { type: 'KEY', key }))
  }

  function pressBackspace() {
    if (cheering) return
    setTyping((s) => reduceTyping(s, { type: 'BACKSPACE' }))
  }

  useEffect(() => {
    if (!typing.wrong) return
    const id = window.setTimeout(() => {
      setTyping((s) => reduceTyping(s, { type: 'CLEAR_WRONG' }))
    }, 350)
    return () => window.clearTimeout(id)
  }, [typing.wrong])

  useEffect(() => {
    if (!isWordComplete(typing) || cheering || finishingRef.current) return

    finishingRef.current = true
    setCheering(true)
    const nextWords = recordTypedWord(wordsRef.current)
    onWordsChange(nextWords)

    const id = window.setTimeout(() => {
      const nextIndex = wordIndex + 1
      if (nextIndex >= level.words.length) {
        onWordsChange(completeWordLevel(nextWords, levelId))
        onLevelComplete()
        return
      }
      setWordIndex(nextIndex)
      setTyping(createTypingState(level.words[nextIndex]))
      setDropKey((k) => k + 1)
      setCheering(false)
      finishingRef.current = false
    }, 500)

    return () => window.clearTimeout(id)
  }, [
    typing,
    cheering,
    wordIndex,
    level.words,
    levelId,
    onWordsChange,
    onLevelComplete,
  ])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (cheering) return
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
  }, [cheering])

  const done = typing.word.slice(0, typing.index)
  const current = typing.word[typing.index] ?? ''
  const todo = typing.word.slice(typing.index + 1)

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
            className={`falling-word${typing.wrong ? ' shake' : ''}${cheering ? ' cheer-word' : ''}`}
            aria-live="polite"
          >
            <span className="done">{done}</span>
            {current ? <span className="current">{current}</span> : null}
            {todo ? <span className="todo">{todo}</span> : null}
          </p>
        </div>
        <p className="hint">
          {cheering
            ? 'You typed it!'
            : 'Tap the letters or use a keyboard'}
        </p>
        <p className="word-progress-count">
          Word {wordIndex + 1} of {level.words.length}
        </p>
        <div className="words-keyboard" aria-label="Letter keys">
          {LETTER_ROWS.map((row) => (
            <div key={row} className="words-key-row">
              {row.split('').map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className="words-key"
                  disabled={cheering}
                  onClick={() => pressKey(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
          <div className="words-key-row">
            <button
              type="button"
              className="words-key words-key-wide"
              disabled={cheering}
              onClick={pressBackspace}
            >
              ⌫ Erase
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
