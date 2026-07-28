import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import {
  PAALS,
  chaptersForPaal,
  type PaalId,
} from '../content/thirukkural'
import type { TamizhProgress } from '../types'

type Props = {
  paalId: PaalId
  tamizh: TamizhProgress
  onBack: () => void
  onPick: (chapterId: number) => void
}

export function ThirukkuralChapters({
  paalId,
  tamizh,
  onBack,
  onPick,
}: Props) {
  const paal = PAALS[paalId]
  const chapters = chaptersForPaal(paalId)

  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen thirukkural-chapters">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Books
        </button>
        <p className="eyebrow">
          {paal.emoji} {paal.nameEn}
        </p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <h1 className="display">{paal.nameTa}</h1>
      <p className="subtitle">Tap a chapter — each has 10 kurals</p>

      <div className="mission-list thirukkural-chapter-list">
        {chapters.map((chapter) => {
          const read = tamizh.readChapterIds.includes(chapter.id)
          return (
            <button
              key={chapter.id}
              type="button"
              className="mission-card"
              onClick={() => {
                playSfx('tap')
                onPick(chapter.id)
              }}
            >
              <span className="mission-emoji" aria-hidden="true">
                {String(chapter.id).padStart(2, '0')}
              </span>
              <span className="mission-text">
                <span className="mission-title">{chapter.nameTa}</span>
                <span className="mission-blurb">{chapter.nameEn}</span>
              </span>
              <span className="mission-badge">
                {read ? (
                  <span aria-label="read">✓</span>
                ) : (
                  <span aria-hidden="true">›</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
