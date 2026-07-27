import { useEffect } from 'react'
import { playSfx, stopBgm } from '../audio/sounds'
import { Rainbow } from '../components/Rainbow'
import { SoundToggle } from '../components/SoundToggle'
import { getWordLevel, type WordLevelId } from '../content/wordLevels'

type Props = {
  levelId: WordLevelId
  onMap: () => void
  onHub: () => void
}

export function WordsLevelClear({ levelId, onMap, onHub }: Props) {
  const level = getWordLevel(levelId)

  useEffect(() => {
    stopBgm()
    playSfx('cheer')
  }, [])

  return (
    <main className="screen words-clear">
      <SoundToggle active={false} />
      <Rainbow />
      <h1 className="display cheer">You finished {level.title}!</h1>
      <p>
        {level.emoji} Great typing under the rainbow.
      </p>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            playSfx('tap')
            onMap()
          }}
        >
          More themes
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            playSfx('tap')
            onHub()
          }}
        >
          Games
        </button>
      </div>
    </main>
  )
}
