import { useEffect, useState } from 'react'
import './App.css'
import {
  clearProgress,
  completeStation,
  emptyProgress,
  loadProgress,
  saveProgress,
} from './progress/progress'
import { Celebration } from './screens/Celebration'
import { LabMap } from './screens/LabMap'
import { LaptopBonus } from './screens/LaptopBonus'
import { StationScene } from './screens/StationScene'
import { Welcome } from './screens/Welcome'
import type { AppProgress, Screen } from './types'

export default function App() {
  const [progress, setProgress] = useState<AppProgress>(() => loadProgress())
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
        progress={progress.lab}
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

  return (
    <Celebration
      onMap={() => setScreen({ name: 'map' })}
      onReplay={() => {
        clearProgress()
        setProgress(emptyProgress())
        setScreen({ name: 'welcome' })
      }}
    />
  )
}
