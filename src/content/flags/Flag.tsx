import { useState } from 'react'
import { curatedIdForCode, flagUrl } from '../countries'
import { FlagSvg } from './FlagSvg'

/**
 * Real flag artwork from flagcdn.com — keyless, CORS-open, SVG, so it stays
 * sharp at any size and covers every country without anyone drawing one.
 *
 * The twelve hand-drawn flags stay as the offline fallback: they are the only
 * ones the game shipped with, and a kid on a dead train should still get a
 * round out of it.
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
  const [failed, setFailed] = useState(false)
  const drawn = curatedIdForCode(code)

  if (failed && drawn) {
    return <FlagSvg id={drawn} className={className} title={title} />
  }

  return (
    <img
      className={className}
      src={flagUrl(code)}
      alt={title ?? ''}
      onError={() => setFailed(true)}
    />
  )
}
