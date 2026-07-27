import {
  regionLabel,
  type MapBoardId,
  type MapRegionId,
} from '../countries'

type Props = {
  board: MapBoardId
  highlight?: MapRegionId
  selectable?: boolean
  selectedId?: MapRegionId | null
  correctId?: MapRegionId | null
  wrongId?: MapRegionId | null
  disabled?: boolean
  onSelect?: (id: MapRegionId) => void
}

type RegionLayout = {
  id: MapRegionId
  left: string
  top: string
  width: string
  height: string
}

const BOARDS: Record<
  MapBoardId,
  { label: string; regions: RegionLayout[] }
> = {
  'asia-pacific': {
    label: 'Asia and Oceania',
    regions: [
      { id: 'india', left: '6%', top: '48%', width: '28%', height: '30%' },
      { id: 'china', left: '32%', top: '22%', width: '34%', height: '34%' },
      { id: 'japan', left: '72%', top: '28%', width: '20%', height: '24%' },
      { id: 'australia', left: '54%', top: '62%', width: '32%', height: '28%' },
    ],
  },
  europe: {
    label: 'Europe',
    regions: [
      {
        id: 'united-kingdom',
        left: '12%',
        top: '12%',
        width: '24%',
        height: '26%',
      },
      { id: 'france', left: '22%', top: '40%', width: '26%', height: '28%' },
      { id: 'spain', left: '12%', top: '68%', width: '26%', height: '24%' },
      { id: 'italy', left: '48%', top: '48%', width: '24%', height: '36%' },
    ],
  },
  africa: {
    label: 'Africa',
    regions: [
      { id: 'egypt', left: '40%', top: '6%', width: '28%', height: '22%' },
      {
        id: 'west-africa',
        left: '6%',
        top: '30%',
        width: '30%',
        height: '28%',
      },
      {
        id: 'east-africa',
        left: '48%',
        top: '34%',
        width: '30%',
        height: '28%',
      },
      {
        id: 'south-africa',
        left: '34%',
        top: '68%',
        width: '30%',
        height: '24%',
      },
    ],
  },
  americas: {
    label: 'Americas',
    regions: [
      { id: 'canada', left: '22%', top: '4%', width: '42%', height: '22%' },
      {
        id: 'united-states',
        left: '18%',
        top: '26%',
        width: '40%',
        height: '22%',
      },
      { id: 'mexico', left: '16%', top: '48%', width: '28%', height: '18%' },
      { id: 'brazil', left: '40%', top: '56%', width: '36%', height: '32%' },
    ],
  },
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
 * Simplified continent map — soft regions for geography practice.
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
}: Props) {
  const def = BOARDS[board]

  return (
    <div
      className="continent-map"
      role="img"
      aria-label={`${def.label} map`}
    >
      <p className="map-board-label">{def.label}</p>
      <div className="map-stage">
        {def.regions.map((r) => {
          const label = regionLabel(r.id)
          const className = regionClass(
            r.id,
            highlight,
            selectedId,
            correctId,
            wrongId,
          )
          const style = {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          }
          if (selectable) {
            return (
              <button
                key={r.id}
                type="button"
                className={className}
                style={style}
                disabled={disabled}
                aria-label={label}
                onClick={() => onSelect?.(r.id)}
              >
                {label}
              </button>
            )
          }
          return (
            <div
              key={r.id}
              className={className}
              style={style}
              aria-hidden="true"
            >
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
