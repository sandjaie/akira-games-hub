import { describe, expect, it } from 'vitest'
import { usableLines } from './countryFacts'

describe('usableLines', () => {
  it('keeps sentences that name a long country', () => {
    const lines = usableLines(
      'Liechtenstein is a small country in Europe. It sits between Switzerland and Austria.',
      'Liechtenstein',
      'Vaduz',
    )
    expect(lines[0]).toBe('Liechtenstein is a small country in Europe.')
    expect(lines).toHaveLength(2)
  })

  it('drops the capital sentence the card already shows', () => {
    const lines = usableLines(
      'Peru is a country in South America. The capital is Lima. Machu Picchu is found in Peru.',
      'Peru',
      'Lima',
    )
    expect(lines.join(' ')).not.toContain('capital')
    expect(lines).toContain('Machu Picchu is found in Peru.')
  })

  it('still drops sentences written for grown-ups', () => {
    const lines = usableLines(
      'Chad has a population density of 8.6 per square kilogram unit measure value.',
      'Chad',
      "N'Djamena",
    )
    expect(lines).toHaveLength(0)
  })

  it('honours the line limit', () => {
    const lines = usableLines(
      'Japan is a country in Asia. It is made of many islands. Mount Fuji is there. Sushi comes from Japan. Trains are very fast.',
      'Japan',
      'Tokyo',
      2,
    )
    expect(lines).toHaveLength(2)
  })
})

describe('age filter', () => {
  it('drops sentences a six-year-old should not meet on a reward screen', () => {
    const lines = usableLines(
      'Poland is a country in Europe. It was invaded in 1939. Many people were killed.',
      'Poland',
      'Warsaw',
    )
    expect(lines).toEqual(['Poland is a country in Europe.'])
  })

  it('drops the beer and keeps the castles', () => {
    const lines = usableLines(
      'Czechia is a country in Central Europe. It is famous for castles and world-class beer. Prague sits on the Vltava river.',
      'Czechia',
      'Prague',
    )
    expect(lines.join(' ')).not.toContain('beer')
    expect(lines).toContain('Czechia is a country in Central Europe.')
  })
})
