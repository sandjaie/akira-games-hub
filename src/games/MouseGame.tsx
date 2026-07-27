import { useRef, useState } from 'react'
import { playSfx } from '../audio/sounds'
import type { MiniGameProps } from './types'

const SIZE = 52
const TARGET = { x: 220, y: 40, w: 72, h: 72 }

function hit(x: number, y: number) {
  return (
    x + SIZE / 2 > TARGET.x &&
    x + SIZE / 2 < TARGET.x + TARGET.w &&
    y + SIZE / 2 > TARGET.y &&
    y + SIZE / 2 < TARGET.y + TARGET.h
  )
}

export function MouseGame({ onComplete }: MiniGameProps) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 24, y: 140 })
  const dragging = useRef(false)
  const done = useRef(false)

  const moveTo = (clientX: number, clientY: number) => {
    const arena = arenaRef.current
    if (!arena) return
    const rect = arena.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width - SIZE, clientX - rect.left - SIZE / 2))
    const y = Math.max(0, Math.min(rect.height - SIZE, clientY - rect.top - SIZE / 2))
    setPos({ x, y })
    if (!done.current && hit(x, y)) {
      done.current = true
      playSfx('correct')
      onComplete()
    }
  }

  return (
    <div className="game">
      <p className="game-hint">Drag the pointer to the star.</p>
      <div
        className="mouse-arena"
        ref={arenaRef}
        onPointerMove={(e) => {
          if (!dragging.current) return
          moveTo(e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerLeave={() => {
          dragging.current = false
        }}
      >
        <div
          className="target-pad"
          style={{ left: TARGET.x, top: TARGET.y }}
          aria-hidden="true"
        >
          ★
        </div>
        <div
          className="pointer-knob"
          style={{ left: pos.x, top: pos.y }}
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            moveTo(e.clientX, e.clientY)
          }}
        >
          ▲
        </div>
      </div>
    </div>
  )
}
