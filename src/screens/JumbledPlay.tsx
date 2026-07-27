import { useEffect, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import {
  loadJumbledRound,
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
    pool: scrambled,
    slots: emptySlots(entry.word.length),
  }
}

export function JumbledPlay({ difficulty, onBack, onRoundComplete }: Props) {
  const [round, setRound] = useState<JumbledEntry[] | null>(null)
  const [index, setIndex] = useState(0)
  const [pool, setPool] = useState<LetterTile[]>([])
  const [slots, setSlots] = useState<Array<LetterTile | null>>([])
  const [firstLetterHint, setFirstLetterHint] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [hintsUsed, setHintsUsed] = useState(0)

  useEffect(() => {
    stopBgm()
    let cancelled = false
    setRound(null)
    setHintsUsed(0)
    void loadJumbledRound(difficulty).then((entries) => {
      if (cancelled || entries.length === 0) return
      const puzzle = buildPuzzle(entries[0])
      setRound(entries)
      setIndex(0)
      setPool(puzzle.pool)
      setSlots(puzzle.slots)
      setFirstLetterHint(false)
      setFeedback('idle')
      playSfx('whoosh')
    })
    return () => {
      cancelled = true
    }
  }, [difficulty])

  const entry = round?.[index]
  const word = entry?.word ?? ''

  function loadEntry(nextIndex: number) {
    const nextEntry = round?.[nextIndex]
    if (!nextEntry) return
    const puzzle = buildPuzzle(nextEntry)
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
      if (isAnswerCorrect(nextSlots, word)) {
        setFeedback('correct')
        playSfx('word')
      } else {
        setFeedback('wrong')
        playSfx('wrong')
      }
    } else {
      setFeedback('idle')
      playSfx('tap')
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
    playSfx('tap')
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
    playSfx('hint')
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
    if (!round) return
    if (feedback === 'correct') {
      playSfx('whoosh')
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
      playSfx('word')
      return
    }
    setFeedback('wrong')
    playSfx('wrong')
  }

  useEffect(() => {
    if (feedback !== 'wrong') return
    const id = window.setTimeout(() => setFeedback('idle'), 700)
    return () => window.clearTimeout(id)
  }, [feedback])

  useEffect(() => {
    if (!round) return

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

  if (!round || !entry) {
    return (
      <main className="screen jumbled-play">
        <SoundToggle active={false} />
        <div className="words-top-row">
          <button type="button" className="secondary" onClick={onBack}>
            ← Levels
          </button>
          <p className="eyebrow">
            {difficulty === 'easy' ? 'Easy' : 'Medium'}
          </p>
          <span className="words-top-spacer" />
        </div>
        <p className="hint" role="status">
          Finding new jumbled words…
        </p>
      </main>
    )
  }

  const clue =
    difficulty === 'easy' ? (
      <p className="jumbled-clue" aria-label={`Picture clue ${entry.emoji ?? ''}`}>
        <span className="jumbled-emoji" aria-hidden="true">
          {entry.emoji ?? '🔤'}
        </span>
      </p>
    ) : (
      <p className="jumbled-clue">
        Category: <strong>{entry.category ?? 'Word'}</strong>
      </p>
    )

  return (
    <main className="screen jumbled-play">
      <SoundToggle active={false} />
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
