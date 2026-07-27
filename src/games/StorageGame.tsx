import { useState } from 'react'
import type { MiniGameProps } from './types'

const FILES = [
  { id: 'pic', label: '📷 Photo' },
  { id: 'song', label: '🎵 Song' },
]

export function StorageGame({ onComplete }: MiniGameProps) {
  const [inBox, setInBox] = useState<string[]>([])

  const put = (id: string) => {
    if (inBox.includes(id)) return
    const next = [...inBox, id]
    setInBox(next)
    if (next.length === FILES.length) onComplete()
  }

  return (
    <div className="game">
      <p className="game-hint">Tap the files into the Storage box.</p>
      <div className="storage-box" aria-label="Storage box">
        {inBox.length === 0 ? <span>Empty box</span> : null}
        {inBox.map((id) => (
          <span key={id} className="file-chip">
            {FILES.find((f) => f.id === id)?.label}
          </span>
        ))}
      </div>
      <div className="game-row">
        {FILES.map((file) => (
          <button
            key={file.id}
            type="button"
            className="file-chip"
            disabled={inBox.includes(file.id)}
            onClick={() => put(file.id)}
          >
            {file.label}
          </button>
        ))}
      </div>
    </div>
  )
}
