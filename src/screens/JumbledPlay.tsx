import { useEffect, useMemo, useState } from 'react'
import {
  pickRound,
  type JumbledDifficulty,
  type JumbledEntry,
} from '../content/jumbledWords'
import {
  emptySlots,
  isAnswerCorrect,
  revealFirstSlot,
  scrambleTiles,
  starsFromHints,
  tilesFromWord,
  type LetterTile,
} from '../jumbled/scramble'

type Props = {
  difficulty: JumbledDifficulty
  onBack: () => void
  onRoundComplete: (stars: 1 | 2 | 3) => void
}

type Feedback = 'idle' | 'wrong' | 'correct'

function buildPuzzle(entry: JumbledEntry) {
  const base = tilesFromWord(entry.word)
  const scrambled = scrambleTiles(base)
  return {
    entry,
    pool: scrambled,
    slots: emptySlots(entry.word.length),
    firstLetterHint: false,
  }
}

export function JumbledPlay({ difficulty, onBack, onRoundComplete }: Props) {
  const round = useMemo(() => pickRound(difficulty), [difficulty])
  const [index, setIndex] = useState(0)
  const [pool, setPool] = useState<LetterTile[]>(() =>
    scrambleTiles(tilesFromWord(round[0].word)),
  )
  const [slots, setSlots] = useState<Array<LetterTile | null>>(() =>
    emptySlots(round[0].word.length),
  )
  const [firstLetterHint, setFirstLetterHint] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [hintsUsed, setHintsUsed] = useState(0)

  const entry = round[index]
  const word = entry.word

  function loadEntry(nextIndex: number) {
    const puzzle = buildPuzzle(round[nextIndex])
    setIndex(nextIndex)
    setPool(puzzle.pool)
    setSlots(puzzle.slots)
    setFirstLetterHint(false)
    setFeedback('idle')
  }

  function placeTile(tile: LetterTile) {
    if (feedback === 'correct') return
    const empty = slots.findIndex((s) => s === null)
    if (empty === -1) return
    const nextSlots = [...slots]
    nextSlots[empty] = tile
    const nextPool = pool.filter((t) => t.id !== tile.id)
    setPool(nextPool)
    setSlots(nextSlots)

    if (nextSlots.every((s) => s !== null)) {
      if (isAnswerCorrect(nextSlots, word)) setFeedback('correct')
      else setFeedback('wrong')
    } else {
      setFeedback('idle')
    }
  }

  function returnSlot(slotIndex: number) {
    if (feedback === 'correct') return
    const tile = slots[slotIndex]
    if (!tile) return
    setSlots((s) => {
      const next = [...s]
      next[slotIndex] = null
      return next
    })
    setPool((p) => [...p, tile])
    setFeedback('idle')
  }

  function resetPlacement() {
    if (feedback === 'correct') return
    const returned = slots.filter((s): s is LetterTile => s !== null)
    setPool((p) => scrambleTiles([...p, ...returned]))
    setSlots(emptySlots(word.length))
    setFeedback('idle')
    setFirstLetterHint(false)
  }

  function useHint() {
    if (feedback === 'correct') return
    setHintsUsed((h) => h + 1)
    if (difficulty === 'easy') {
      setFirstLetterHint(true)
      return
    }
    const revealed = revealFirstSlot(word, pool, slots)
    setPool(revealed.pool)
    setSlots(revealed.slots)
    setFeedback('idle')
  }

  function checkOrAdvance() {
    if (feedback === 'correct') {
      if (index + 1 >= round.length) {
        onRoundComplete(starsFromHints(hintsUsed))
        return
      }
      loadEntry(index + 1)
      return
    }

    if (!slots.every((s) => s !== null)) return
    if (isAnswerCorrect(slots, word)) {
      setFeedback('correct')
      return
    }
    setFeedback('wrong')
  }

  useEffect(() => {
    if (feedback !== 'wrong') return
    const id = window.setTimeout(() => setFeedback('idle'), 700)
    return () => window.clearTimeout(id)
  }, [feedback])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (feedback === 'correct') return
        for (let i = slots.length - 1; i >= 0; i--) {
          if (slots[i]) {
            returnSlot(i)
            return
          }
        }
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        checkOrAdvance()
        return
      }
      if (feedback === 'correct') return
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        e.preventDefault()
        const letter = e.key.toUpperCase()
        const tile = pool.find((t) => t.letter === letter)
        if (tile) placeTile(tile)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const clue =
    difficulty === 'easy' ? (
      <p className="jumbled-clue" aria-label={`Picture clue ${entry.emoji}`}>
        <span className="jumbled-emoji" aria-hidden="true">
          {entry.emoji}
        </span>
      </p>
    ) : (
      <p className="jumbled-clue">
        Category: <strong>{entry.category}</strong>
      </p>
    )

  return (
    <main className="screen jumbled-play">
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Levels
        </button>
        <p className="eyebrow">
          {difficulty === 'easy' ? 'Easy' : 'Medium'} · Word {index + 1} of{' '}
          {round.length}
        </p>
        <span className="words-top-spacer" />
      </div>

      <h1 className="display">Jumbled Words</h1>
      <p className="hint">Tap letters to build the word</p>
      {clue}

      {firstLetterHint ? (
        <p className="jumbled-hint-banner" role="status">
          Hint: it starts with <strong>{word[0]}</strong>
        </p>
      ) : null}

      <div
        className={`jumbled-slots${feedback === 'wrong' ? ' shake' : ''}${feedback === 'correct' ? ' correct' : ''}`}
        role="group"
        aria-label="Answer slots"
      >
        {slots.map((tile, i) => (
          <button
            key={`slot-${i}`}
            type="button"
            className={`jumbled-slot${tile ? ' filled' : ''}${firstLetterHint && i === 0 ? ' hint-slot' : ''}`}
            onClick={() => returnSlot(i)}
            disabled={!tile || feedback === 'correct'}
            aria-label={
              tile
                ? `Letter ${tile.letter} in position ${i + 1}. Tap to put back.`
                : `Empty slot ${i + 1}`
            }
          >
            {tile?.letter ?? ''}
          </button>
        ))}
      </div>

      <div className="jumbled-pool" role="group" aria-label="Letter tiles">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className="jumbled-tile"
            onClick={() => placeTile(tile)}
            disabled={feedback === 'correct'}
            aria-label={`Letter ${tile.letter}`}
          >
            {tile.letter}
          </button>
        ))}
      </div>

      <p className="jumbled-feedback" role="status" aria-live="polite">
        {feedback === 'correct'
          ? 'You got it!'
          : feedback === 'wrong'
            ? 'Try again'
            : '\u00a0'}
      </p>

      <div className="jumbled-controls">
        <button
          type="button"
          className="secondary"
          onClick={useHint}
          disabled={feedback === 'correct'}
          aria-label={
            difficulty === 'easy'
              ? 'Hint: show the first letter'
              : 'Hint: fill the first slot'
          }
        >
          Hint
        </button>
        <button
          type="button"
          className="secondary"
          onClick={resetPlacement}
          disabled={feedback === 'correct'}
          aria-label="Reset letters"
        >
          Reset
        </button>
        {feedback === 'correct' ? (
          <button type="button" onClick={checkOrAdvance}>
            {index + 1 >= round.length ? 'See stars' : 'Next →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={checkOrAdvance}
            disabled={!slots.every((s) => s !== null)}
            aria-label="Check answer"
          >
            Check
          </button>
        )}
      </div>
    </main>
  )
}
