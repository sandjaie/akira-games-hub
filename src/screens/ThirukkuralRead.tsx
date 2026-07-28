import { useEffect, useState } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { getChapter, kuralsForChapter } from '../content/thirukkural'

type Props = {
  chapterId: number
  startIndex?: number
  onBack: () => void
  onChapterRead: () => void
}

export function ThirukkuralRead({
  chapterId,
  startIndex = 0,
  onBack,
  onChapterRead,
}: Props) {
  const chapter = getChapter(chapterId)
  const kurals = kuralsForChapter(chapterId)
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, startIndex), kurals.length - 1),
  )
  const kural = kurals[index]
  const last = index >= kurals.length - 1

  useEffect(() => {
    stopBgm()
  }, [])

  useEffect(() => {
    setIndex(Math.min(Math.max(0, startIndex), kurals.length - 1))
  }, [chapterId, startIndex, kurals.length])

  return (
    <main className="screen thirukkural-read">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Chapters
        </button>
        <p className="eyebrow">
          குறள் {kural.number} · Ch {chapter.id}
        </p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <p className="kural-chapter-label">
        <span className="kural-chapter-ta">{chapter.nameTa}</span>
        <span className="kural-chapter-en">{chapter.nameEn}</span>
      </p>

      <article className="kural-card" aria-live="polite">
        <p className="kural-number">திருக்குறள் {kural.number}</p>
        <p className="kural-line">{kural.line1}</p>
        <p className="kural-line">{kural.line2}</p>

        <div className="kural-meaning">
          <p className="kural-meaning-label">குழந்தைகளுக்கான விளக்கம்</p>
          <p className="kural-meaning-ta">{kural.meaningTa}</p>
        </div>

        <div className="kural-meaning">
          <p className="kural-meaning-label">For kids (English)</p>
          <p className="kural-meaning-en">{kural.meaningEn}</p>
        </div>
      </article>

      <p className="learn-count">
        Kural {index + 1} of {kurals.length}
      </p>

      <div className="learn-dots" aria-hidden="true">
        {kurals.map((k, i) => (
          <span
            key={k.number}
            className={`learn-dot${i === index ? ' on' : ''}`}
          />
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
              onChapterRead()
              onBack()
            }}
          >
            Chapter done ✓
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              playSfx('whoosh')
              const next = index + 1
              setIndex(next)
              if (next === kurals.length - 1) onChapterRead()
            }}
          >
            Next kural →
          </button>
        )}
      </div>
    </main>
  )
}
