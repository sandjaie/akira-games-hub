import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  loadJumbledRound,
  type JumbledEntry,
} from '../content/jumbledWords'
import { JumbledPlay } from './JumbledPlay'

vi.mock('../audio/sounds', () => ({
  isMuted: () => false,
  playSfx: vi.fn(),
  setMuted: vi.fn(),
  startBgm: vi.fn(),
  stopBgm: vi.fn(),
  unlockAudio: vi.fn(),
}))

vi.mock('../content/jumbledWords', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../content/jumbledWords')>()
  return { ...actual, loadJumbledRound: vi.fn() }
})

describe('JumbledPlay', () => {
  it('shows the first puzzle after the asynchronous round loads', async () => {
    let resolveRound!: (entries: JumbledEntry[]) => void
    vi.mocked(loadJumbledRound).mockReturnValue(
      new Promise((resolve) => {
        resolveRound = resolve
      }),
    )

    render(
      <JumbledPlay
        difficulty="easy"
        onBack={vi.fn()}
        onRoundComplete={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Finding new jumbled words…'),
    ).toBeInTheDocument()

    resolveRound([{ word: 'CAT', emoji: '🐱' }])

    expect(
      await screen.findByRole('heading', { name: 'Jumbled Words' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Letter tiles' }),
    ).toBeInTheDocument()
  })
})
