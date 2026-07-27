import type { ReactNode } from 'react'
import type { CountryId } from '../countries'

type Props = {
  id: CountryId
  className?: string
  title?: string
}

/** Simplified kid-friendly flag SVGs (patterns, not photo-real). */
export function FlagSvg({ id, className, title }: Props) {
  const label = title ?? id
  return (
    <svg
      className={className}
      viewBox="0 0 120 80"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <rect width="120" height="80" rx="6" fill="#e8eef4" />
      {FLAG_DRAW[id]()}
    </svg>
  )
}

const FLAG_DRAW: Record<CountryId, () => ReactNode> = {
  india: () => (
    <>
      <rect y="0" width="120" height="27" fill="#ff9933" />
      <rect y="27" width="120" height="26" fill="#ffffff" />
      <rect y="53" width="120" height="27" fill="#138808" />
      <circle cx="60" cy="40" r="10" fill="none" stroke="#000080" strokeWidth="2" />
      <circle cx="60" cy="40" r="2" fill="#000080" />
    </>
  ),
  japan: () => (
    <>
      <rect width="120" height="80" fill="#ffffff" />
      <circle cx="60" cy="40" r="18" fill="#bc002d" />
    </>
  ),
  china: () => (
    <>
      <rect width="120" height="80" fill="#de2910" />
      <polygon points="24,16 28,28 16,20 32,20 20,28" fill="#ffde00" />
      <polygon points="42,10 44,16 38,12 46,12 40,16" fill="#ffde00" />
      <polygon points="48,22 50,28 44,24 52,24 46,28" fill="#ffde00" />
      <polygon points="48,36 50,42 44,38 52,38 46,42" fill="#ffde00" />
      <polygon points="42,46 44,52 38,48 46,48 40,52" fill="#ffde00" />
    </>
  ),
  australia: () => (
    <>
      <rect width="120" height="80" fill="#00008b" />
      <rect width="50" height="40" fill="#00008b" />
      {/* Mini union jack blocks */}
      <rect width="50" height="40" fill="#012169" />
      <path d="M0 0 L50 40 M50 0 L0 40" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L50 40 M50 0 L0 40" stroke="#c8102e" strokeWidth="2" />
      <rect x="22" width="6" height="40" fill="#fff" />
      <rect y="17" width="50" height="6" fill="#fff" />
      <rect x="23" width="4" height="40" fill="#c8102e" />
      <rect y="18" width="50" height="4" fill="#c8102e" />
      <polygon points="85,48 88,58 78,52 92,52 82,58" fill="#fff" />
      <polygon points="70,28 72,34 66,30 74,30 68,34" fill="#fff" />
      <polygon points="95,22 97,28 91,24 99,24 93,28" fill="#fff" />
      <polygon points="100,55 102,61 96,57 104,57 98,61" fill="#fff" />
    </>
  ),
  egypt: () => (
    <>
      <rect y="0" width="120" height="27" fill="#ce1126" />
      <rect y="27" width="120" height="26" fill="#ffffff" />
      <rect y="53" width="120" height="27" fill="#000000" />
      <polygon points="60,32 68,48 52,48" fill="#c09300" />
    </>
  ),
  'south-africa': () => (
    <>
      <rect width="120" height="80" fill="#002395" />
      <rect y="0" width="120" height="28" fill="#e03c31" />
      <rect y="52" width="120" height="28" fill="#007a4d" />
      <polygon points="0,0 48,40 0,80" fill="#000000" />
      <polygon points="0,12 36,40 0,68" fill="#ffb612" />
      <polygon points="0,22 26,40 0,58" fill="#007a4d" />
      <rect y="32" width="120" height="16" fill="#ffffff" />
    </>
  ),
  france: () => (
    <>
      <rect width="40" height="80" fill="#002395" />
      <rect x="40" width="40" height="80" fill="#ffffff" />
      <rect x="80" width="40" height="80" fill="#ed2939" />
    </>
  ),
  italy: () => (
    <>
      <rect width="40" height="80" fill="#009246" />
      <rect x="40" width="40" height="80" fill="#ffffff" />
      <rect x="80" width="40" height="80" fill="#ce2b37" />
    </>
  ),
  'united-kingdom': () => (
    <>
      <rect width="120" height="80" fill="#012169" />
      <path d="M0 0 L120 80 M120 0 L0 80" stroke="#fff" strokeWidth="16" />
      <path d="M0 0 L120 80 M120 0 L0 80" stroke="#c8102e" strokeWidth="8" />
      <rect x="50" width="20" height="80" fill="#fff" />
      <rect y="30" width="120" height="20" fill="#fff" />
      <rect x="54" width="12" height="80" fill="#c8102e" />
      <rect y="34" width="120" height="12" fill="#c8102e" />
    </>
  ),
  canada: () => (
    <>
      <rect width="30" height="80" fill="#ff0000" />
      <rect x="30" width="60" height="80" fill="#ffffff" />
      <rect x="90" width="30" height="80" fill="#ff0000" />
      <polygon
        points="60,18 66,34 82,34 70,44 74,60 60,50 46,60 50,44 38,34 54,34"
        fill="#ff0000"
      />
    </>
  ),
  'united-states': () => (
    <>
      <rect width="120" height="80" fill="#ffffff" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          y={i * (80 / 7)}
          width="120"
          height={80 / 14}
          fill="#b22234"
        />
      ))}
      <rect width="50" height="45" fill="#3c3b6e" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={8 + col * 12}
            cy={8 + row * 14}
            r="2"
            fill="#fff"
          />
        )),
      )}
    </>
  ),
  brazil: () => (
    <>
      <rect width="120" height="80" fill="#009c3b" />
      <polygon points="60,10 110,40 60,70 10,40" fill="#ffdf00" />
      <circle cx="60" cy="40" r="16" fill="#002776" />
      <path
        d="M44 38 Q60 28 76 38"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
      />
    </>
  ),
}
