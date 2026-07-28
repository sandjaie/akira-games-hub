import { describe, expect, it } from 'vitest'
import {
  artForText,
  isKidReadable,
  splitSentences,
  tidySentence,
  toKidCard,
} from './factEngine'

describe('fact engine', () => {
  it('keeps plain kid sentences', () => {
    expect(
      isKidReadable('A comet is a ball of mostly ice that moves around in outer space.'),
    ).toBe(true)
    expect(isKidReadable('Jupiter is the largest planet in the Solar System.')).toBe(
      true,
    )
  })

  it('throws out grown-up sentences', () => {
    // real Simple Wikipedia text that must never reach a six-year-old
    expect(
      isKidReadable(
        'On average, Saturn is about 9.57 astronomical units away from the Sun.',
      ),
    ).toBe(false)
    expect(
      isKidReadable('It gives off infrared energy, ultraviolet light and radio waves.'),
    ).toBe(false)
    expect(isKidReadable('Gas giants are a subtype of giant planets.')).toBe(false)
    expect(isKidReadable('Too short.')).toBe(false)
    expect(
      isKidReadable(
        'This sentence runs on and on and on with far too many words for a young reader to follow in one go without help.',
      ),
    ).toBe(false)
  })

  it('strips brackets and asides before judging', () => {
    expect(
      tidySentence('The Moon, also known as Luna, is Earth’s only moon (mostly).'),
    ).toBe('The Moon is Earth’s only moon.')
  })

  it('splits a summary into sentences', () => {
    const parts = splitSentences(
      'A galaxy is a group of many stars. Most galaxies look misty. Ours is the Milky Way.',
    )
    expect(parts).toHaveLength(3)
  })

  it('picks art from the words when no hint is given', () => {
    expect(artForText('Saturn has bright rings')).toBe('saturn')
    expect(artForText('a shooting star burns up')).toBe('meteor')
    expect(artForText('something unrelated')).toBe('stars')
    expect(artForText('Saturn', 'rocket')).toBe('rocket')
  })

  it('turns a summary into a card of at most two lines', () => {
    const card = toKidCard(
      { title: 'Comet', page: 'Comet' },
      'A comet is a ball of mostly ice that moves around in outer space. Comets are often described as dirty snowballs. They are very different from asteroids. Their orbits have high eccentricity.',
    )
    expect(card).not.toBeNull()
    expect(card!.title).toBe('Comet')
    expect(card!.lines).toHaveLength(2)
    expect(card!.art).toBe('comet')
    expect(card!.lines.join(' ')).not.toContain('eccentricity')
  })

  it('gives up rather than showing a bad card', () => {
    const card = toKidCard(
      { title: 'Nothing usable', page: 'X' },
      'Its apparent magnitude varies with axial tilt and orbital eccentricity.',
    )
    expect(card).toBeNull()
  })

  describe('photos', () => {
    const summary = 'An aurora is a natural light display in the sky.'
    const cardWith = (thumb?: {
      source?: string
      width?: number
      height?: number
    }) => toKidCard({ title: 'Aurora', page: 'Aurora' }, summary, thumb)

    it('keeps a roughly square or landscape picture', () => {
      const card = cardWith({ source: 'a.jpg', width: 330, height: 337 })
      expect(card!.photo).toBe('a.jpg')
    })

    it('drops a tall portrait that would crop to nonsense', () => {
      const card = cardWith({ source: 'tall.jpg', width: 200, height: 600 })
      expect(card!.photo).toBeUndefined()
    })

    it('drops a wide banner and falls back to the drawing', () => {
      const card = cardWith({ source: 'wide.jpg', width: 900, height: 200 })
      expect(card!.photo).toBeUndefined()
      expect(card!.art).toBe('blue-sky')
    })

    it('copes with no picture at all', () => {
      expect(cardWith()!.photo).toBeUndefined()
      expect(cardWith({ source: 'x.jpg' })!.photo).toBeUndefined()
    })
  })
})
