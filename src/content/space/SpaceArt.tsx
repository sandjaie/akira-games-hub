/** Flat space illustrations. One SVG per idea, drawn in a 120x120 box. */
export type SpaceArtKind =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'solar-system'
  | 'rocky-planets'
  | 'giant-planets'
  | 'moon'
  | 'moon-phases'
  | 'craters'
  | 'far-side'
  | 'asteroid-belt'
  | 'comet'
  | 'meteor'
  | 'meteorite'
  | 'galaxy'
  | 'milky-way'
  | 'stars'
  | 'light-year'
  | 'blue-sky'
  | 'sunset'
  | 'rainbow-light'
  | 'raindrops'
  | 'rocket'
  | 'astronaut'
  | 'volcano'
  | 'telescope'

const SPACE = '#151a3a'
const STAR = '#fdf6d8'

function Stars({ seed = 0, count = 14 }: { seed?: number; count?: number }) {
  // fixed pseudo-random specks so the sky never re-shuffles on a re-render
  return (
    <g fill={STAR}>
      {Array.from({ length: count }, (_, i) => {
        const n = (i + 1) * (seed + 7)
        const x = (n * 37) % 116 + 2
        const y = (n * 61) % 112 + 4
        const r = i % 5 === 0 ? 1.6 : 1
        return <circle key={i} cx={x} cy={y} r={r} opacity={i % 3 ? 0.9 : 0.6} />
      })}
    </g>
  )
}

/**
 * Sunlight from the top left and a soft shadow at the bottom right, so a flat
 * circle reads as a round ball. Kept gentle on purpose: Mars still has to look
 * obviously red to a six-year-old.
 */
function Shading({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="url(#art-shade)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#art-lit)" />
    </>
  )
}

/** A plain lit ball, for the little planets in the group pictures. */
function Orb({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number
  cy: number
  r: number
  fill: string
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <Shading cx={cx} cy={cy} r={r} />
    </g>
  )
}

function Planet({
  cx = 60,
  cy = 60,
  r = 30,
  fill,
  children,
}: {
  cx?: number
  cy?: number
  r?: number
  fill: string
  children?: React.ReactNode
}) {
  const clip = `clip-${fill.replace('#', '')}-${cx}-${cy}-${r}`
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <clipPath id={clip}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>{children}</g>
      <Shading cx={cx} cy={cy} r={r} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="2"
      />
    </g>
  )
}

const MERCURY = (
  <Planet fill="#9aa0a6">
    <circle cx="52" cy="52" r="6" fill="#7f858b" />
    <circle cx="70" cy="68" r="4" fill="#7f858b" />
    <circle cx="58" cy="76" r="3" fill="#7f858b" />
  </Planet>
)

const VENUS = (
  <Planet fill="#e8b96a">
    <path d="M30 46q30 -10 60 0" stroke="#f5d9a6" strokeWidth="7" fill="none" />
    <path d="M30 62q30 -10 60 0" stroke="#f5d9a6" strokeWidth="6" fill="none" />
    <path d="M30 78q30 -10 60 0" stroke="#f5d9a6" strokeWidth="5" fill="none" />
  </Planet>
)

const EARTH = (
  <Planet fill="#4aa3dd">
    <path
      d="M34 52q10 -12 22 -4t16 -2 12 6 -6 12 -18 2 -14 8 -12 -8Z"
      fill="#63c07a"
    />
    <path d="M74 78q10 -6 16 2t-10 8Z" fill="#63c07a" />
    <ellipse cx="46" cy="40" rx="12" ry="5" fill="rgba(255,255,255,0.6)" />
    <ellipse cx="74" cy="72" rx="14" ry="5" fill="rgba(255,255,255,0.45)" />
  </Planet>
)

const MARS = (
  <Planet fill="#d2603c">
    <ellipse cx="60" cy="34" rx="12" ry="5" fill="#f0e6dd" />
    <ellipse cx="60" cy="86" rx="10" ry="4" fill="#f0e6dd" />
    <circle cx="50" cy="58" r="5" fill="#b04c2d" />
    <circle cx="72" cy="66" r="4" fill="#b04c2d" />
  </Planet>
)

const JUPITER = (
  <Planet fill="#e0b184">
    <path d="M30 46h60" stroke="#c99364" strokeWidth="8" />
    <path d="M30 62h60" stroke="#f2d3ab" strokeWidth="7" />
    <path d="M30 76h60" stroke="#c99364" strokeWidth="7" />
    <ellipse cx="70" cy="66" rx="9" ry="6" fill="#c0442f" />
  </Planet>
)

const SATURN = (
  <g>
    <ellipse
      cx="60"
      cy="62"
      rx="52"
      ry="15"
      fill="none"
      stroke="#e6d3a3"
      strokeWidth="7"
      transform="rotate(-14 60 62)"
    />
    <Planet cy={62} r={26} fill="#f0d9a6">
      <path d="M30 54h60" stroke="#dcc287" strokeWidth="7" />
      <path d="M30 70h60" stroke="#dcc287" strokeWidth="6" />
    </Planet>
    <path
      d="M12 52a52 15 0 0 0 30 22"
      fill="none"
      stroke="#e6d3a3"
      strokeWidth="7"
      transform="rotate(-14 60 62)"
    />
  </g>
)

const URANUS = (
  <Planet fill="#8fd8e0">
    <ellipse
      cx="60"
      cy="60"
      rx="14"
      ry="40"
      fill="none"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="4"
    />
  </Planet>
)

const NEPTUNE = (
  <Planet fill="#5679d8">
    <path d="M30 50q30 -8 60 0" stroke="#7f9ce8" strokeWidth="6" fill="none" />
    <circle cx="50" cy="70" r="7" fill="#3b57ad" />
  </Planet>
)

const PLUTO = (
  <g>
    <Planet r={18} fill="#d9cbb8">
      <path d="M46 66q14 10 30 0" stroke="#bda98f" strokeWidth="8" fill="none" />
    </Planet>
    <text x="60" y="106" textAnchor="middle" className="space-art-label">
      tiny!
    </text>
  </g>
)

const SUN = (
  <g>
    <g stroke="#ffd257" strokeWidth="6" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * 36}
            y1={60 + Math.sin(a) * 36}
            x2={60 + Math.cos(a) * 50}
            y2={60 + Math.sin(a) * 50}
          />
        )
      })}
    </g>
    <circle cx="60" cy="60" r="52" fill="url(#art-glow)" />
    <circle cx="60" cy="60" r="34" fill="#ffce3d" />
    <circle cx="60" cy="60" r="24" fill="#ffe37a" />
    <circle cx="60" cy="60" r="13" fill="#fff6cf" />
  </g>
)

const MOON = (
  <Planet fill="#dfe3e8">
    <circle cx="48" cy="48" r="8" fill="#c3c9d1" />
    <circle cx="70" cy="62" r="6" fill="#c3c9d1" />
    <circle cx="56" cy="76" r="5" fill="#c3c9d1" />
  </Planet>
)

/** Sunlit fraction from the left, like the Moon we see from Earth. */
function Phase({ cx, lit }: { cx: number; lit: number }) {
  const id = `phase-${cx}`
  return (
    <g>
      <circle cx={cx} cy={60} r={16} fill="#3b4460" />
      <clipPath id={id}>
        <circle cx={cx} cy={60} r={16} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {lit >= 1 ? (
          <circle cx={cx} cy={60} r={16} fill="#f3f0e0" />
        ) : lit <= 0 ? null : (
          <>
            <rect x={cx} y={44} width="16" height="32" fill="#f3f0e0" />
            <ellipse
              cx={cx}
              cy={60}
              rx={Math.abs(16 - lit * 32)}
              ry={16}
              fill={lit < 0.5 ? '#3b4460' : '#f3f0e0'}
            />
          </>
        )}
      </g>
      <circle
        cx={cx}
        cy={60}
        r={16}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </g>
  )
}

/**
 * `zoom` blows the subject up around the middle of the box so it fills the
 * card instead of floating in a sea of empty sky. Only set it on pictures with
 * nothing pinned to an edge — anything with ground, a caption or a wide ring
 * stays at 1 or it would get cropped.
 */
const ART: Record<
  SpaceArtKind,
  { space?: boolean; zoom?: number; bare?: boolean; body: React.ReactNode }
> = {
  // `bare` = draws no background box, so the card shadow would trace the rays
  sun: { zoom: 1.1, bare: true, body: SUN },
  mercury: { space: true, zoom: 1.3, body: MERCURY },
  venus: { space: true, zoom: 1.3, body: VENUS },
  earth: { space: true, zoom: 1.3, body: EARTH },
  mars: { space: true, zoom: 1.3, body: MARS },
  jupiter: { space: true, zoom: 1.3, body: JUPITER },
  saturn: { space: true, zoom: 1.08, body: SATURN },
  uranus: { space: true, zoom: 1.3, body: URANUS },
  neptune: { space: true, zoom: 1.3, body: NEPTUNE },
  pluto: { space: true, body: PLUTO },
  moon: { space: true, zoom: 1.3, body: MOON },

  'solar-system': {
    space: true,
    body: (
      <g>
        <circle cx="2" cy="60" r="20" fill="#ffce3d" />
        {[
          ['#9aa0a6', 28, 4],
          ['#e8b96a', 40, 6],
          ['#4aa3dd', 53, 6],
          ['#d2603c', 65, 5],
          ['#e0b184', 82, 11],
          ['#f0d9a6', 105, 8],
        ].map(([fill, x, r]) => (
          <Orb
            key={x as number}
            cx={x as number}
            cy={60}
            r={r as number}
            fill={fill as string}
          />
        ))}
        <ellipse
          cx="105"
          cy="60"
          rx="14"
          ry="4.5"
          fill="none"
          stroke="#e6d3a3"
          strokeWidth="3"
        />
      </g>
    ),
  },

  'rocky-planets': {
    space: true,
    body: (
      <g>
        {[
          ['#9aa0a6', 26, 10],
          ['#e8b96a', 52, 13],
          ['#4aa3dd', 82, 14],
          ['#d2603c', 108, 10],
        ].map(([fill, x, r]) => (
          <Orb
            key={x as number}
            cx={x as number}
            cy={60}
            r={r as number}
            fill={fill as string}
          />
        ))}
      </g>
    ),
  },

  'giant-planets': {
    space: true,
    body: (
      <g>
        <circle cx="34" cy="60" r="28" fill="#e0b184" />
        <path d="M8 52h52" stroke="#c99364" strokeWidth="6" />
        <Shading cx={34} cy={60} r={28} />
        <circle cx="90" cy="60" r="20" fill="#f0d9a6" />
        <Shading cx={90} cy={60} r={20} />
        <ellipse
          cx="90"
          cy="60"
          rx="34"
          ry="9"
          fill="none"
          stroke="#e6d3a3"
          strokeWidth="4"
        />
      </g>
    ),
  },

  'moon-phases': {
    space: true,
    body: (
      <g>
        <Phase cx={20} lit={0} />
        <Phase cx={53} lit={0.5} />
        <Phase cx={86} lit={1} />
        <text x="20" y="92" textAnchor="middle" className="space-art-label">
          new
        </text>
        <text x="53" y="92" textAnchor="middle" className="space-art-label">
          half
        </text>
        <text x="86" y="92" textAnchor="middle" className="space-art-label">
          full
        </text>
      </g>
    ),
  },

  craters: {
    space: true,
    zoom: 1.15,
    body: (
      <g>
        <circle cx="60" cy="66" r="34" fill="#dfe3e8" />
        <circle cx="46" cy="56" r="9" fill="#bfc6ce" />
        <circle cx="46" cy="56" r="5" fill="#d5dae0" />
        <circle cx="72" cy="70" r="7" fill="#bfc6ce" />
        <circle cx="58" cy="82" r="5" fill="#bfc6ce" />
        <Shading cx={60} cy={66} r={34} />
        <path
          d="M96 16l-16 22"
          stroke="#ff9f43"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="78" cy="42" r="5" fill="#ff8fa6" />
      </g>
    ),
  },

  'far-side': {
    space: true,
    body: (
      <g>
        <circle cx="44" cy="60" r="26" fill="#dfe3e8" />
        <circle cx="36" cy="52" r="6" fill="#c3c9d1" />
        <circle cx="52" cy="68" r="5" fill="#c3c9d1" />
        <Shading cx={44} cy={60} r={26} />
        <path
          d="M78 60h34"
          stroke="#ffd257"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M78 42h28M78 78h28"
          stroke="#ffd257"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        <text x="60" y="100" textAnchor="middle" className="space-art-label">
          <tspan x="60">sunlight on</tspan>
          <tspan x="60" dy="13">
            both sides
          </tspan>
        </text>
      </g>
    ),
  },

  'asteroid-belt': {
    space: true,
    body: (
      <g>
        <circle cx="60" cy="60" r="10" fill="#d2603c" />
        <circle cx="60" cy="60" r="46" fill="none" stroke="#3b4460" strokeWidth="16" />
        <g fill="#a7a29b">
          {[0, 40, 75, 120, 165, 205, 250, 290, 320].map((deg, i) => {
            const a = (deg * Math.PI) / 180
            return (
              <circle
                key={deg}
                cx={60 + Math.cos(a) * 46}
                cy={60 + Math.sin(a) * 46}
                r={i % 3 === 0 ? 5 : 3.5}
              />
            )
          })}
        </g>
        <circle cx="106" cy="18" r="9" fill="#e0b184" />
      </g>
    ),
  },

  comet: {
    space: true,
    zoom: 1.1,
    body: (
      <g>
        <path
          d="M96 34C70 44 44 62 14 92"
          stroke="#8fd8e0"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M92 38C70 48 50 64 26 88"
          stroke="#cdf3f7"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="98" cy="32" r="12" fill="#e9fbff" />
        <circle cx="98" cy="32" r="6" fill="#8fd8e0" />
      </g>
    ),
  },

  meteor: {
    space: true,
    body: (
      <g>
        <path
          d="M18 96C44 70 66 46 94 22"
          stroke="#ffd257"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M30 96C52 74 70 54 92 32"
          stroke="#ff9f43"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="96" cy="20" r="7" fill="#fff3c4" />
        <text x="60" y="112" textAnchor="middle" className="space-art-label">
          shooting star
        </text>
      </g>
    ),
  },

  meteorite: {
    space: true,
    body: (
      <g>
        <rect x="0" y="86" width="120" height="34" fill="#63c07a" />
        <path d="M46 86q14 -22 28 0Z" fill="#8b6b3d" />
        <circle cx="60" cy="72" r="13" fill="#6d6a66" />
        <circle cx="55" cy="68" r="4" fill="#514f4c" />
        <path
          d="M28 20l22 26"
          stroke="#ff9f43"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    ),
  },

  galaxy: {
    space: true,
    zoom: 1.15,
    body: (
      <g>
        <ellipse cx="60" cy="60" rx="46" ry="30" fill="#2a3160" />
        <path
          d="M60 60c22 -16 38 2 30 14M60 60c-22 16 -38 -2 -30 -14"
          stroke="#b9c6ff"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="60" cy="60" rx="14" ry="10" fill="#fff3c4" />
      </g>
    ),
  },

  'milky-way': {
    space: true,
    body: (
      <g>
        <path
          d="M0 84C36 66 84 54 120 30"
          stroke="#b9c6ff"
          strokeWidth="26"
          opacity="0.35"
          fill="none"
        />
        <path
          d="M0 84C36 66 84 54 120 30"
          stroke="#e7ecff"
          strokeWidth="10"
          opacity="0.7"
          fill="none"
        />
        <circle cx="52" cy="70" r="4" fill="#ffd257" />
        <text x="60" y="108" textAnchor="middle" className="space-art-label">
          our galaxy
        </text>
      </g>
    ),
  },

  stars: { space: true, body: <Stars seed={3} count={26} /> },

  'light-year': {
    space: true,
    body: (
      <g>
        <circle cx="16" cy="60" r="10" fill="#4aa3dd" />
        <circle cx="104" cy="60" r="7" fill="#fff3c4" />
        <path
          d="M30 60h60"
          stroke="#ffd257"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="9 7"
        />
        <path d="M92 54l8 6-8 6" fill="#ffd257" />
        <text x="60" y="96" textAnchor="middle" className="space-art-label">
          how far light goes
        </text>
      </g>
    ),
  },

  'blue-sky': {
    body: (
      <g>
        <rect x="0" y="0" width="120" height="120" fill="#7cc7e8" />
        <circle cx="96" cy="26" r="16" fill="#ffd257" />
        <ellipse cx="34" cy="46" rx="24" ry="12" fill="#fffdf8" />
        <ellipse cx="52" cy="40" rx="14" ry="10" fill="#fffdf8" />
        <rect x="0" y="96" width="120" height="24" fill="#63c07a" />
      </g>
    ),
  },

  sunset: {
    body: (
      <g>
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5679d8" />
            <stop offset="55%" stopColor="#ff9f43" />
            <stop offset="100%" stopColor="#f0544f" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="120" height="120" fill="url(#dusk)" />
        <circle cx="60" cy="86" r="18" fill="#ffe37a" />
        <rect x="0" y="96" width="120" height="24" fill="#3b4460" />
      </g>
    ),
  },

  'rainbow-light': {
    body: (
      <g>
        <rect x="0" y="0" width="120" height="120" fill="#151a3a" />
        {/* white sunlight goes in on the left */}
        <path
          d="M2 52h48"
          stroke="#fffdf8"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* the colours fan out on the right, drawn behind the glass */}
        {['#f0544f', '#ff9f43', '#ffd257', '#63c07a', '#4aa3dd', '#845ef7'].map(
          (c, i) => (
            <path
              key={c}
              d={`M68 56L113 ${31 + i * 12}`}
              stroke={c}
              strokeWidth="7"
              strokeLinecap="round"
            />
          ),
        )}
        {/* the glass prism */}
        <path d="M60 16l36 70H24Z" fill="#bfe9f2" opacity="0.9" />
        <path d="M60 16L24 86h15Z" fill="#eafaff" opacity="0.9" />
      </g>
    ),
  },

  raindrops: {
    body: (
      <g>
        <rect x="0" y="0" width="120" height="120" fill="#9fd6ee" />
        <ellipse cx="40" cy="30" rx="28" ry="14" fill="#e8eef3" />
        <g stroke="#4aa3dd" strokeWidth="5" strokeLinecap="round">
          <path d="M24 54v14M44 60v14M64 52v14M84 62v14" />
        </g>
        {['#f0544f', '#ffd257', '#63c07a', '#4aa3dd'].map((c, i) => (
          <path
            key={c}
            d={`M${18 + i * 3} ${114 - i * 3}a${44 - i * 3} ${34 - i * 3} 0 0 1 ${
              (44 - i * 3) * 2
            } 0`}
            fill="none"
            stroke={c}
            strokeWidth="6"
          />
        ))}
      </g>
    ),
  },

  rocket: {
    space: true,
    zoom: 1.3,
    body: (
      <g>
        <path d="M60 12c14 16 18 34 18 52H42c0-18 4-36 18-52Z" fill="#fffdf8" />
        <circle cx="60" cy="44" r="8" fill="#4aa3dd" />
        <path d="M42 64l-16 16h16Zm36 0l16 16H78Z" fill="#f0544f" />
        <path d="M50 64h20v14H50Z" fill="#e8eef3" />
        <path d="M52 80q8 22 16 0Z" fill="#ff9f43" />
        <path d="M56 84q4 14 8 0Z" fill="#ffd257" />
      </g>
    ),
  },

  astronaut: {
    space: true,
    zoom: 1.25,
    body: (
      <g>
        <rect x="42" y="52" width="36" height="42" rx="12" fill="#fffdf8" />
        <circle cx="60" cy="40" r="22" fill="#fffdf8" />
        <path
          d="M46 40a14 14 0 0 1 28 0 14 14 0 0 1 -28 0Z"
          fill="#2a3160"
        />
        <ellipse cx="54" cy="36" rx="5" ry="3" fill="#8fd8e0" />
        <rect x="28" y="58" width="14" height="26" rx="7" fill="#e8eef3" />
        <rect x="78" y="58" width="14" height="26" rx="7" fill="#e8eef3" />
      </g>
    ),
  },

  volcano: {
    space: true,
    body: (
      <g>
        <rect x="0" y="92" width="120" height="28" fill="#d2603c" />
        <path d="M18 92L60 24l42 68Z" fill="#a44b2d" />
        <path d="M44 56h32l-8 -12h-16Z" fill="#8f3f24" />
        <path d="M52 44q8 -14 16 0Z" fill="#f0e6dd" />
        <text x="60" y="112" textAnchor="middle" className="space-art-label">
          Olympus Mons
        </text>
      </g>
    ),
  },

  telescope: {
    space: true,
    zoom: 1.15,
    body: (
      <g>
        <rect
          x="30"
          y="46"
          width="60"
          height="20"
          rx="8"
          fill="#e8eef3"
          transform="rotate(-24 60 56)"
        />
        <circle cx="88" cy="38" r="12" fill="#8fd8e0" />
        <path d="M46 74l-14 30h56l-24 -30Z" fill="#6d8093" />
        <Stars seed={5} count={8} />
      </g>
    ),
  },
}

type Props = { kind: SpaceArtKind; className?: string }

export function SpaceArt({ kind, className }: Props) {
  const art = ART[kind]
  return (
    <svg
      className={`space-art${art.bare ? ' space-art-bare' : ''}${
        className ? ` ${className}` : ''
      }`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="art-lit" cx="34%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="art-shade" cx="76%" cy="78%" r="72%">
          <stop offset="0%" stopColor="#0b1030" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#0b1030" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0b1030" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="art-glow">
          <stop offset="0%" stopColor="#ffd257" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffd257" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffd257" stopOpacity="0" />
        </radialGradient>
      </defs>
      {art.space ? (
        <>
          <rect x="0" y="0" width="120" height="120" fill={SPACE} />
          <Stars seed={kind.length} />
        </>
      ) : null}
      {art.zoom ? (
        <g
          transform={`translate(60 60) scale(${art.zoom}) translate(-60 -60)`}
        >
          {art.body}
        </g>
      ) : (
        art.body
      )}
    </svg>
  )
}
