import {
  MAP_BOARD_REGIONS,
  regionLabel,
  type MapBoardId,
  type MapRegionId,
} from '../countries'
import { BOARD_PATHS } from './mapPaths'

type Props = {
  board: MapBoardId
  highlight?: MapRegionId
  selectable?: boolean
  selectedId?: MapRegionId | null
  correctId?: MapRegionId | null
  wrongId?: MapRegionId | null
  disabled?: boolean
  onSelect?: (id: MapRegionId) => void
  /** Tapped the map but not a country. */
  onMiss?: () => void
}

const BOARD_LABELS: Record<MapBoardId, string> = {
  'asia-pacific': 'Asia and Oceania',
  europe: 'Europe',
  africa: 'Africa',
  americas: 'Americas',
}

function regionClass(
  id: MapRegionId,
  highlight?: MapRegionId,
  selectedId?: MapRegionId | null,
  correctId?: MapRegionId | null,
  wrongId?: MapRegionId | null,
): string {
  const parts = ['map-region']
  if (correctId === id) parts.push('correct')
  else if (wrongId === id) parts.push('wrong')
  else if (selectedId === id) parts.push('selected')
  else if (highlight === id) parts.push('highlight')
  return parts.join(' ')
}

/**
 * Real (Natural Earth) continent outlines. Names are never drawn on the map —
 * the whole game is naming the highlighted shape.
 */
export function ContinentMap({
  board,
  highlight,
  selectable = false,
  selectedId = null,
  correctId = null,
  wrongId = null,
  disabled = false,
  onSelect,
  onMiss,
}: Props) {
  const label = BOARD_LABELS[board]
  const paths = BOARD_PATHS[board]
  const [vx, vy, vw, vh] = paths.viewBox.split(' ').map(Number)

  return (
    <div className="continent-map">
      <p className="map-board-label">{label}</p>
      <svg
        className="map-stage"
        viewBox={paths.viewBox}
        style={{ aspectRatio: `${vw} / ${vh}` }}
        preserveAspectRatio="xMidYMid meet"
        role={selectable ? 'group' : 'img'}
        aria-label={`${label} map`}
      >
        <g className="map-land" aria-hidden="true">
          {paths.land.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </g>
        {selectable && !disabled ? (
          // catches taps that land nowhere, so the map never feels dead
          <rect
            className="map-miss"
            x={vx}
            y={vy}
            width={vw}
            height={vh}
            aria-hidden="true"
            onClick={() => onMiss?.()}
          />
        ) : null}
        {MAP_BOARD_REGIONS[board].map((id) => {
          const className = regionClass(
            id,
            highlight,
            selectedId,
            correctId,
            wrongId,
          )
          const shape = (
            <path className={className} d={paths.regions[id]} aria-hidden="true" />
          )
          if (!selectable) return <g key={id}>{shape}</g>
          return (
            <g key={id}>
              {shape}
              {/* fat transparent twin: small countries stay tappable by a 5yo */}
              <path
                className="map-hit"
                d={paths.regions[id]}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-label={regionLabel(id)}
                // don't take focus from a tap — Chrome paints a focus ring on
                // any tabbable non-button, which reads as another answer colour
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => !disabled && onSelect?.(id)}
                onKeyDown={(e) => {
                  if (disabled) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(id)
                  }
                }}
              />
            </g>
          )
        })}
        {/* on reveal, name the answer on the map itself */}
        {correctId ? (
          <text
            className="map-name"
            x={paths.labels[correctId][0]}
            y={paths.labels[correctId][1]}
            textAnchor="middle"
            aria-hidden="true"
          >
            {regionLabel(correctId)}
          </text>
        ) : null}
      </svg>
    </div>
  )
}
