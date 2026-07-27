import { Rainbow } from '../components/Rainbow'
import { getWordLevel, type WordLevelId } from '../content/wordLevels'

type Props = {
  levelId: WordLevelId
  onMap: () => void
  onHub: () => void
}

export function WordsLevelClear({ levelId, onMap, onHub }: Props) {
  const level = getWordLevel(levelId)

  return (
    <main className="screen words-clear">
      <Rainbow />
      <h1 className="display cheer">You finished {level.title}!</h1>
      <p>
        {level.emoji} Great typing under the rainbow.
      </p>
      <div className="actions">
        <button type="button" onClick={onMap}>
          More themes
        </button>
        <button type="button" className="secondary" onClick={onHub}>
          Games
        </button>
      </div>
    </main>
  )
}
