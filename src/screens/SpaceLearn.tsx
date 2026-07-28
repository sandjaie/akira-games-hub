import { useEffect, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getMission, type LearnCard, type MissionId } from '../content/space'
import { SpaceArt } from '../content/space/SpaceArt'
import {
  loadMissionExtras,
  loadTodayCards,
  todayCardsOffline,
} from '../content/spaceLive'

type Props = {
  missionId: MissionId
  onBack: () => void
  onLearned: () => void
  onQuiz: () => void
}

export function SpaceLearn({ missionId, onBack, onLearned, onQuiz }: Props) {
  const mission = getMission(missionId)
  const [index, setIndex] = useState(0)
  const [cards, setCards] = useState<LearnCard[]>(() =>
    missionId === 'today' ? todayCardsOffline() : mission.cards,
  )
  const card = cards[index]
  const last = index >= cards.length - 1

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    setIndex(0)
    let cancelled = false

    // what we already have shows at once; new cards join when they arrive
    const base =
      missionId === 'today' ? todayCardsOffline() : getMission(missionId).cards
    setCards(base)

    const load =
      missionId === 'today'
        ? loadTodayCards().then((live) => (live.length > 0 ? live : base))
        : loadMissionExtras(missionId).then((extra) => [...base, ...extra])

    void load.then((next) => {
      if (!cancelled) setCards(next)
    })
    return () => {
      cancelled = true
    }
  }, [missionId])

  return (
    <main className="screen space-learn">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Missions
        </button>
        <p className="eyebrow">
          {mission.emoji} {mission.title}
        </p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <article className="learn-card" aria-live="polite">
        <SpaceArt kind={card.art} className="learn-art" />
        <h1 className="learn-title">{card.title}</h1>
        {card.lines.map((line) => (
          <p key={line} className="learn-line">
            {line}
          </p>
        ))}
      </article>

      <p className="learn-count">
        Card {index + 1} of {cards.length}
      </p>

      <div className="learn-dots" aria-hidden="true">
        {cards.map((c, i) => (
          <span key={c.title} className={`learn-dot${i === index ? ' on' : ''}`} />
        ))}
      </div>

      <div className="learn-actions">
        <button
          type="button"
          className="secondary"
          disabled={index === 0}
          onClick={() => {
            playSfx('tap')
            setIndex((i) => Math.max(0, i - 1))
          }}
        >
          ← Back
        </button>
        {last ? (
          <button
            type="button"
            onClick={() => {
              playSfx('cheer')
              onLearned()
              onQuiz()
            }}
          >
            Try the quiz 🚀
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              playSfx('whoosh')
              const next = index + 1
              setIndex(next)
              // reaching the last card counts as read, quiz or not
              if (next === cards.length - 1) onLearned()
            }}
          >
            Next card →
          </button>
        )}
      </div>
    </main>
  )
}
