import { flagUrl } from '../countries'

/**
 * Real flag artwork from flagcdn.com — keyless, CORS-open, SVG, so it stays
 * sharp at any size and covers every country without anyone drawing one.
 */
export function Flag({
  code,
  className,
  title,
}: {
  code: string
  className?: string
  title?: string
}) {
  return <img className={className} src={flagUrl(code)} alt={title ?? ''} />
}
