import { useEffect, useState } from 'react'
import './App.css'
import {
  clearProgress,
  completeStation,
  emptyProgress,
  loadProgress,
  recordCountriesRound,
  recordJumbledRound,
  saveProgress,
} from './progress/progress'
import { loadPlayerName, savePlayerName } from './content/explorer'
import { Celebration } from './screens/Celebration'
import { CountriesDifficulty } from './screens/CountriesDifficulty'
import { CountriesMode } from './screens/CountriesMode'
import { CountriesPlay } from './screens/CountriesPlay'
import { CountriesResults } from './screens/CountriesResults'
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
  const [player, setPlayer] = useState<string>(() => loadPlayerName())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    savePlayerName(player)
  }, [player])

  if (screen.name === 'welcome') {
    return (
      <Welcome
        name={player}
        onName={setPlayer}
        onLab={() => setScreen({ name: 'map' })}
        onWords={() => setScreen({ name: 'words-map' })}
        onJumbled={() => setScreen({ name: 'jumbled-difficulty' })}
        onCountries={() => setScreen({ name: 'countries-mode' })}
      />
    )
  }

  if (screen.name === 'map') {
    return (
      <LabMap
        name={player}
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
        name={player}
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
        name={player}
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

  if (screen.name === 'countries-mode') {
    return (
      <CountriesMode
        onBack={() => setScreen({ name: 'welcome' })}
        onPick={(mode) => setScreen({ name: 'countries-difficulty', mode })}
      />
    )
  }

  if (screen.name === 'countries-difficulty') {
    return (
      <CountriesDifficulty
        mode={screen.mode}
        countries={progress.countries}
        onBack={() => setScreen({ name: 'countries-mode' })}
        onPick={(difficulty) =>
          setScreen({
            name: 'countries-play',
            mode: screen.mode,
            difficulty,
          })
        }
      />
    )
  }

  if (screen.name === 'countries-play') {
    return (
      <CountriesPlay
        mode={screen.mode}
        difficulty={screen.difficulty}
        onBack={() =>
          setScreen({ name: 'countries-difficulty', mode: screen.mode })
        }
        onRoundComplete={(score, asked, stars) => {
          setProgress((p) => ({
            ...p,
            countries: recordCountriesRound(
              p.countries,
              screen.mode,
              screen.difficulty,
              stars,
            ),
          }))
          setScreen({
            name: 'countries-results',
            mode: screen.mode,
            difficulty: screen.difficulty,
            score,
            asked,
            stars,
          })
        }}
      />
    )
  }

  if (screen.name === 'countries-results') {
    return (
      <CountriesResults
        mode={screen.mode}
        difficulty={screen.difficulty}
        score={screen.score}
        asked={screen.asked}
        stars={screen.stars}
        onReplay={() =>
          setScreen({
            name: 'countries-play',
            mode: screen.mode,
            difficulty: screen.difficulty,
          })
        }
        onModes={() => setScreen({ name: 'countries-mode' })}
        onHub={() => setScreen({ name: 'welcome' })}
      />
    )
  }

  return (
    <Celebration
      name={player}
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
