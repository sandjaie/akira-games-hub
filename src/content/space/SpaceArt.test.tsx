import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpaceArt, type SpaceArtKind } from './SpaceArt'

const KINDS: SpaceArtKind[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'solar-system',
  'rocky-planets',
  'giant-planets',
  'moon',
  'moon-phases',
  'craters',
  'far-side',
  'asteroid-belt',
  'comet',
  'meteor',
  'meteorite',
  'galaxy',
  'milky-way',
  'stars',
  'light-year',
  'blue-sky',
  'sunset',
  'rainbow-light',
  'raindrops',
  'rocket',
  'astronaut',
  'volcano',
  'telescope',
]

describe('SpaceArt', () => {
  it.each(KINDS)('draws %s inside the 120x120 box', (kind) => {
    const { container } = render(<SpaceArt kind={kind} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 120 120')
    // the shading gradients every planet points at have to be in the same svg
    expect(svg?.querySelector('#art-lit')).not.toBeNull()
    expect(svg?.querySelector('#art-shade')).not.toBeNull()
  })

  it('only skips the card shadow on art that draws no background', () => {
    const { container } = render(<SpaceArt kind="sun" />)
    expect(container.querySelector('.space-art-bare')).not.toBeNull()

    const earth = render(<SpaceArt kind="earth" />)
    expect(earth.container.querySelector('.space-art-bare')).toBeNull()
  })
})
