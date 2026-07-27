import { useEffect, useState } from 'react'
import './App.css'
import {
  clearProgress,
  completeStation,
  emptyProgress,
  loadProgress,
  recordJumbledRound,
  saveProgress,
} from './progress/progress'
import { Celebration } from './screens/Celebration'
import { JumbledDifficulty } from './screens/JumbledDifficulty'
import { JumbledPlay } from './screens/JumbledPlay'
import { JumbledResults } from './screens/JumbledResults'
import { LabMap } from './screens/LabMap'
import { LaptopBonus } from './screens/LaptopBonus'
import { StationScene } from './screens/StationScene'
import { Welcome } from './screens/Welcome'
import { WordsLevelClear } from './screens/WordsLevelClear'
import { WordsLevelMap } from './screens/WordsLevelMap'
import { WordsPlay } from './screens/WordsPlay'
import type { AppProgress, Screen } from './types'

export default function App() {
  const [progress, setProgress] = useState<AppProgress>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'welcome' })

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  if (screen.name === 'welcome') {
    return (
      <Welcome
        onLab={() => setScreen({ name: 'map' })}
        onWords={() => setScreen({ name: 'words-map' })}
        onJumbled={() => setScreen({ name: 'jumbled-difficulty' })}
      />
    )
  }

  if (screen.name === 'map') {
    return (
      <LabMap
        progress={progress.lab}
        onHub={() => setScreen({ name: 'welcome' })}
        onOpenStation={(stationId) => setScreen({ name: 'station', stationId })}
        onOpenLaptop={() => setScreen({ name: 'laptop' })}
      />
    )
  }

  if (screen.name === 'station') {
    return (
      <StationScene
        stationId={screen.stationId}
        onBack={() => setScreen({ name: 'map' })}
        onCompletedStation={(id) => {
          setProgress((p) => ({ ...p, lab: completeStation(p.lab, id) }))
        }}
      />
    )
  }

  if (screen.name === 'laptop') {
    return (
      <LaptopBonus
        onBack={() => setScreen({ name: 'map' })}
        onComplete={() => {
          setProgress((p) => ({ ...p, lab: completeStation(p.lab, 'laptop') }))
          setScreen({ name: 'celebration' })
        }}
      />
    )
  }

  if (screen.name === 'words-map') {
    return (
      <WordsLevelMap
        words={progress.words}
        onBack={() => setScreen({ name: 'welcome' })}
        onPlay={(levelId) => setScreen({ name: 'words-play', levelId })}
      />
    )
  }

  if (screen.name === 'words-play') {
    return (
      <WordsPlay
        levelId={screen.levelId}
        words={progress.words}
        onWordsChange={(words) => setProgress((p) => ({ ...p, words }))}
        onBack={() => setScreen({ name: 'words-map' })}
        onLevelComplete={() =>
          setScreen({ name: 'words-clear', levelId: screen.levelId })
        }
      />
    )
  }

  if (screen.name === 'words-clear') {
    return (
      <WordsLevelClear
        levelId={screen.levelId}
        onMap={() => setScreen({ name: 'words-map' })}
        onHub={() => setScreen({ name: 'welcome' })}
      />
    )
  }

  if (screen.name === 'jumbled-difficulty') {
    return (
      <JumbledDifficulty
        jumbled={progress.jumbled}
        onBack={() => setScreen({ name: 'welcome' })}
        onPick={(difficulty) => setScreen({ name: 'jumbled-play', difficulty })}
      />
    )
  }

  if (screen.name === 'jumbled-play') {
    return (
      <JumbledPlay
        difficulty={screen.difficulty}
        onBack={() => setScreen({ name: 'jumbled-difficulty' })}
        onRoundComplete={(stars) => {
          setProgress((p) => ({
            ...p,
            jumbled: recordJumbledRound(p.jumbled, screen.difficulty, stars),
          }))
          setScreen({
            name: 'jumbled-results',
            difficulty: screen.difficulty,
            stars,
          })
        }}
      />
    )
  }

  if (screen.name === 'jumbled-results') {
    return (
      <JumbledResults
        difficulty={screen.difficulty}
        stars={screen.stars}
        onReplay={() =>
          setScreen({ name: 'jumbled-play', difficulty: screen.difficulty })
        }
        onDifficulty={() => setScreen({ name: 'jumbled-difficulty' })}
        onHub={() => setScreen({ name: 'welcome' })}
      />
    )
  }

  return (
    <Celebration
      onHub={() => setScreen({ name: 'welcome' })}
      onMap={() => setScreen({ name: 'map' })}
      onReplay={() => {
        clearProgress()
        setProgress(emptyProgress())
        setScreen({ name: 'welcome' })
      }}
    />
  )
}
