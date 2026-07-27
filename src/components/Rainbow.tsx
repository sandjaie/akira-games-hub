type Props = { size?: 'small' | 'large' }

export function Rainbow({ size = 'large' }: Props) {
  return (
    <div
      className={`rainbow${size === 'small' ? ' small' : ''}`}
      aria-hidden="true"
    >
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
      <span className="rainbow-arc" />
    </div>
  )
}
