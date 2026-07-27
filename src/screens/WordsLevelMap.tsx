import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { Rainbow } from '../components/Rainbow'
import { SoundToggle } from '../components/SoundToggle'
import {
  WORD_LEVEL_ORDER,
  WORD_LEVELS,
  type WordLevelId,
} from '../content/wordLevels'
import { getWordsStatus } from '../progress/progress'
import type { WordsProgress } from '../types'

type Props = {
  words: WordsProgress
  onBack: () => void
  onPlay: (id: WordLevelId) => void
}

export function WordsLevelMap({ words, onBack, onPlay }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen words-map">
      <SoundToggle active={false} />
      <Rainbow />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Games
        </button>
        <p className="eyebrow">Fun with Words</p>
        <span className="words-top-spacer" />
      </div>
      <h1 className="display">Pick a theme</h1>
      <p className="subtitle">Words fall from the rainbow!</p>
      <div className="word-levels">
        {WORD_LEVEL_ORDER.map((id) => {
          const level = WORD_LEVELS[id]
          const status = getWordsStatus(words, id)
          return (
            <button
              key={id}
              type="button"
              className={`word-level status-${status}`}
              disabled={status === 'locked'}
              onClick={() => {
                playSfx('tap')
                onPlay(id)
              }}
            >
              <span>
                {level.emoji} {level.title}
              </span>
              <span className="word-level-badge" aria-hidden="true">
                {status === 'done' ? '⭐' : status === 'locked' ? '🔒' : '▶️'}
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
