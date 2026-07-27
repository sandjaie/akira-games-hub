import { useEffect, useRef, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { Rainbow } from '../components/Rainbow'
import { SoundToggle } from '../components/SoundToggle'
import {
  getWordLevel,
  loadLevelWords,
  type WordLevelId,
} from '../content/wordLevels'
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
  const [roundWords, setRoundWords] = useState<string[] | null>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [typing, setTyping] = useState<TypingState | null>(null)
  const [dropKey, setDropKey] = useState(0)
  const [wordDone, setWordDone] = useState(false)
  const wordsRef = useRef(words)
  wordsRef.current = words

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    let cancelled = false
    setRoundWords(null)
    setTyping(null)
    setWordIndex(0)
    setWordDone(false)
    void loadLevelWords(levelId).then((list) => {
      if (cancelled || list.length === 0) return
      setRoundWords(list)
      setTyping(createTypingState(list[0]))
      setDropKey((k) => k + 1)
      playSfx('whoosh')
    })
    return () => {
      cancelled = true
    }
  }, [levelId])

  function pressKey(key: string) {
    if (!typing || wordDone) return
    const next = reduceTyping(typing, { type: 'KEY', key })
    setTyping(next)
    if (next.wrong) playSfx('wrong')
    else if (next.index > typing.index) playSfx('correct')
  }

  function pressBackspace() {
    if (!typing || wordDone) return
    setTyping((s) => (s ? reduceTyping(s, { type: 'BACKSPACE' }) : s))
    playSfx('tap')
  }

  function advance(countWord: boolean) {
    if (!roundWords || !typing) return
    let nextWords = wordsRef.current
    if (countWord) {
      nextWords = recordTypedWord(nextWords)
      onWordsChange(nextWords)
    }

    const nextIndex = wordIndex + 1
    if (nextIndex >= roundWords.length) {
      onWordsChange(completeWordLevel(nextWords, levelId))
      onLevelComplete()
      return
    }
    setWordIndex(nextIndex)
    setTyping(createTypingState(roundWords[nextIndex]))
    setDropKey((k) => k + 1)
    setWordDone(false)
    playSfx('whoosh')
  }

  function pressDone() {
    if (!typing) return
    if (!isWordComplete(typing) && !wordDone) return
    playSfx('tap')
    advance(true)
  }

  function pressNext() {
    if (!typing) return
    playSfx('tap')
    advance(wordDone || isWordComplete(typing))
  }

  useEffect(() => {
    if (!typing?.wrong) return
    const id = window.setTimeout(() => {
      setTyping((s) => (s ? reduceTyping(s, { type: 'CLEAR_WRONG' }) : s))
    }, 350)
    return () => window.clearTimeout(id)
  }, [typing?.wrong])

  useEffect(() => {
    if (!typing || !isWordComplete(typing) || wordDone) return
    setWordDone(true)
    playSfx('word')
  }, [typing, wordDone])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!typing) return
      if (e.key === 'Enter') {
        e.preventDefault()
        if (wordDone || isWordComplete(typing)) advance(true)
        return
      }
      if (wordDone) return
      if (e.key === 'Backspace') {
        e.preventDefault()
        pressBackspace()
        return
      }
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        e.preventDefault()
        pressKey(e.key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!roundWords || !typing) {
    return (
      <main className="screen words-play">
        <SoundToggle active={false} />
        <div className="words-top-row">
          <button type="button" className="secondary" onClick={onBack}>
            ← Themes
          </button>
          <p className="eyebrow">
            {level.emoji} {level.title}
          </p>
          <span className="words-top-spacer" />
        </div>
        <p className="hint" role="status">
          Finding new words…
        </p>
      </main>
    )
  }

  const done = typing.word.slice(0, typing.index)
  const current = typing.word[typing.index] ?? ''
  const todo = typing.word.slice(typing.index + 1)
  const canDone = wordDone || isWordComplete(typing)
  const isLast = wordIndex >= roundWords.length - 1

  return (
    <main className="screen words-play">
      <SoundToggle active={false} />
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
          Word {wordIndex + 1} of {roundWords.length}
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
