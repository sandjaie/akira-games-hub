import type { LabStationId, StationDefinition } from '../types'

export const LAB_ORDER: LabStationId[] = [
  'monitor',
  'keyboard',
  'mouse',
  'cpu',
  'memory',
  'storage',
  'power',
  'speakers',
  'wifi',
]

export const STATIONS: Record<LabStationId, StationDefinition> = {
  monitor: {
    id: 'monitor',
    kidName: 'Screen',
    grownUpWord: 'Monitor',
    mapLabel: 'Screen',
    blurb: [
      'This is the Screen. It shows pictures and words.',
      'Tap what you see on the Screen!',
    ],
    game: 'monitor',
  },
  keyboard: {
    id: 'keyboard',
    kidName: 'Keyboard',
    mapLabel: 'Keyboard',
    blurb: [
      'The Keyboard has letter buttons.',
      'Tap the letters to write a tiny word!',
    ],
    game: 'keyboard',
  },
  mouse: {
    id: 'mouse',
    kidName: 'Mouse',
    mapLabel: 'Mouse',
    blurb: [
      'The Mouse moves the pointer on the Screen.',
      'Drag the pointer to the star!',
    ],
    game: 'mouse',
  },
  cpu: {
    id: 'cpu',
    kidName: 'Brain',
    grownUpWord: 'CPU',
    mapLabel: 'Brain',
    blurb: [
      'Inside the tower is the Brain. It thinks fast!',
      'Match the pairs to wake it up.',
    ],
    game: 'cpu',
  },
  memory: {
    id: 'memory',
    kidName: 'Memory',
    grownUpWord: 'RAM',
    mapLabel: 'Memory',
    blurb: [
      'Memory helps the computer remember right now.',
      'Watch the lights. Then tap them in order!',
    ],
    game: 'memory',
  },
  storage: {
    id: 'storage',
    kidName: 'Storage box',
    grownUpWord: 'Hard drive',
    mapLabel: 'Storage',
    blurb: [
      'The Storage box keeps files safe for later.',
      'Put the files in the box!',
    ],
    game: 'storage',
  },
  power: {
    id: 'power',
    kidName: 'Power',
    mapLabel: 'Power',
    blurb: [
      'Power wakes the computer up.',
      'Plug it in, then flip the switch!',
    ],
    game: 'power',
  },
  speakers: {
    id: 'speakers',
    kidName: 'Speakers',
    mapLabel: 'Speakers',
    blurb: [
      'Speakers make the sounds you hear.',
      'Go from quiet to loud!',
    ],
    game: 'speakers',
  },
  wifi: {
    id: 'wifi',
    kidName: 'Wifi',
    mapLabel: 'Wifi',
    blurb: [
      'Wifi sends invisible paths for sharing.',
      'Connect the glowing dots!',
    ],
    game: 'wifi',
  },
}
