type Props = { size?: 'small' | 'large' }

const INK = '#d24b72'
const CX = 120
const CY = 92

/** ROYGBIV is too busy at this size — four fat pastel bands read friendlier. */
const BANDS = [
  { color: '#ff8fa6', rx: 106, ry: 58 },
  { color: '#ffe066', rx: 89, ry: 48.5 },
  { color: '#93de9b', rx: 72, ry: 39 },
  { color: '#7cc7e8', rx: 55, ry: 29.5 },
  { color: '#fffdf8', rx: 38, ry: 20 },
]

/** Ring between two concentric arches, so every band gets its own outline. */
function bandPath(i: number): string {
  const o = BANDS[i]
  const n = BANDS[i + 1]
  return [
    `M ${CX - o.rx} ${CY}`,
    `A ${o.rx} ${o.ry} 0 0 1 ${CX + o.rx} ${CY}`,
    `L ${CX + n.rx} ${CY}`,
    `A ${n.rx} ${n.ry} 0 0 0 ${CX - n.rx} ${CY}`,
    'Z',
  ].join(' ')
}

/** Two passes: outlines first, white fills on top, so the puffs read as one cloud. */
function Cloud({ flip = false }: { flip?: boolean }) {
  const puffs = (
    <>
      <circle cx="22" cy="96" r="13" />
      <circle cx="42" cy="88" r="16" />
      <circle cx="61" cy="96" r="11" />
      <rect x="8" y="95" width="64" height="14" rx="7" />
    </>
  )
  return (
    <g transform={flip ? `translate(${240} 0) scale(-1 1)` : undefined}>
      <g fill="none" stroke={INK} strokeWidth="3.5">
        {puffs}
      </g>
      <g fill="#fffdf8" stroke="none">
        {puffs}
      </g>
      <g fill="#ffb3c6" stroke="none">
        <ellipse cx="30" cy="92" rx="3.6" ry="2.4" />
        <ellipse cx="54" cy="92" rx="3.6" ry="2.4" />
      </g>
      <g fill={INK} stroke="none">
        <ellipse cx="36" cy="88" rx="1.9" ry="2.3" />
        <ellipse cx="48" cy="88" rx="1.9" ry="2.3" />
      </g>
      <path
        d="M39 92.5q3 3 6 0"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  )
}

function Sparkle({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <path
      d="M0 0c2.4 4 2.4 6 0 7.6C-2.4 6-2.4 4 0 0Z"
      fill="#ff8fa6"
      transform={`translate(${x} ${y}) scale(${scale})`}
    />
  )
}

export function Rainbow({ size = 'large' }: Props) {
  return (
    <svg
      className={`rainbow${size === 'small' ? ' small' : ''}`}
      viewBox="0 0 240 116"
      aria-hidden="true"
      focusable="false"
    >
      {BANDS.slice(0, -1).map((band, i) => (
        <path
          key={band.color}
          d={bandPath(i)}
          fill={band.color}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      ))}

      {/* shine: a short dash riding along each band */}
      <g fill="none" stroke="#fffdf8" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        {[
          { rx: 97.5, ry: 53.2, offset: -16 },
          { rx: 80.5, ry: 43.7, offset: -21 },
        ].map((s) => (
          <path
            key={s.rx}
            d={`M ${CX - s.rx} ${CY} A ${s.rx} ${s.ry} 0 0 1 ${CX + s.rx} ${CY}`}
            pathLength={100}
            strokeDasharray="8 100"
            strokeDashoffset={s.offset}
          />
        ))}
      </g>

      <Sparkle x={64} y={20} scale={0.9} />
      <Sparkle x={92} y={8} scale={0.8} />
      <Sparkle x={120} y={3} />
      <Sparkle x={148} y={8} scale={0.8} />
      <Sparkle x={176} y={20} scale={0.9} />

      {/* heart under the arch */}
      <path
        d="M120 88c-3.4-5-9.6-1-6.8 3.4L120 97l6.8-5.6c2.8-4.4-3.4-8.4-6.8-3.4Z"
        fill="#ff8fa6"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <Cloud />
      <Cloud flip />
    </svg>
  )
}
