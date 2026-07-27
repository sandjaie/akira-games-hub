import type { ComponentType } from 'react'
import type { GameKind } from '../types'
import { CpuGame } from './CpuGame'
import { KeyboardGame } from './KeyboardGame'
import { MemoryGame } from './MemoryGame'
import { MonitorGame } from './MonitorGame'
import { MouseGame } from './MouseGame'
import { PowerGame } from './PowerGame'
import { SpeakersGame } from './SpeakersGame'
import { StorageGame } from './StorageGame'
import { WifiGame } from './WifiGame'
import type { MiniGameProps } from './types'

export const gameRegistry: Record<GameKind, ComponentType<MiniGameProps>> = {
  monitor: MonitorGame,
  keyboard: KeyboardGame,
  mouse: MouseGame,
  cpu: CpuGame,
  memory: MemoryGame,
  storage: StorageGame,
  power: PowerGame,
  speakers: SpeakersGame,
  wifi: WifiGame,
}
