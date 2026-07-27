import { useEffect, useState } from 'react'
import './App.css'
import {
  clearProgress,
  completeStation,
  loadProgress,
  saveProgress,
} from './progress/progress'
import { Celebration } from './screens/Celebration'
import { LabMap } from './screens/LabMap'
import { LaptopBonus } from './screens/LaptopBonus'
import { StationScene } from './screens/StationScene'
import { Welcome } from './screens/Welcome'
import type { Progress, Screen } from './types'

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'welcome' })

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  if (screen.name === 'welcome') {
    return <Welcome onStart={() => setScreen({ name: 'map' })} />
  }

  if (screen.name === 'map') {
    return (
      <LabMap
        progress={progress}
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
          setProgress((p) => completeStation(p, id))
        }}
      />
    )
  }

  if (screen.name === 'laptop') {
    return (
      <LaptopBonus
        onBack={() => setScreen({ name: 'map' })}
        onComplete={() => {
          setProgress((p) => completeStation(p, 'laptop'))
          setScreen({ name: 'celebration' })
        }}
      />
    )
  }

  return (
    <Celebration
      onMap={() => setScreen({ name: 'map' })}
      onReplay={() => {
        clearProgress()
        setProgress({ completed: [] })
        setScreen({ name: 'welcome' })
      }}
    />
  )
}
