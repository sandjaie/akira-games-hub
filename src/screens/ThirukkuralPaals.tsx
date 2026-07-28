import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { SoundToggle } from '../components/SoundToggle'
import { PAAL_ORDER, PAALS, CHAPTER_COUNT, KURAL_COUNT, type PaalId } from '../content/thirukkural'

type Props = {
  onBack: () => void
  onPick: (paalId: PaalId) => void
}

export function ThirukkuralPaals({ onBack, onPick }: Props) {
  useEffect(() => {
    stopBgm()
  }, [])

  return (
    <main className="screen thirukkural-paals">
      <SoundToggle active={false} />
      <div className="words-top-row">
        <button type="button" className="secondary" onClick={onBack}>
          ← Tamizh
        </button>
        <p className="eyebrow">திருக்குறள்</p>
        <span className="words-top-spacer" aria-hidden="true" />
      </div>

      <h1 className="display">Two big books</h1>
      <p className="subtitle">
        {CHAPTER_COUNT} chapters · {KURAL_COUNT} kurals for kids
      </p>

      <div className="hub-cards">
        {PAAL_ORDER.map((id) => {
          const paal = PAALS[id]
          return (
            <button
              key={id}
              type="button"
              className={`hub-card tamizh-paal-${id}`}
              onClick={() => {
                playSfx('whoosh')
                onPick(id)
              }}
            >
              <span className="hub-icon" aria-hidden="true">
                {paal.emoji}
              </span>
              <span>
                <span className="hub-title">{paal.nameTa}</span>
                <span className="hub-blurb">{paal.nameEn}</span>
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
