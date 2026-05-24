import type { AppIconComponent } from '../../desktopData'

export function TaskbarWindowButton({
  icon,
  title,
  active,
  compact,
  onClick,
}: {
  icon: AppIconComponent
  title: string
  active: boolean
  compact: boolean
  onClick: () => void
}) {
  const Icon = icon

  return (
    <button
      type="button"
      className={`taskbar-window-btn${active ? ' is-active' : ''}`}
      aria-label={title}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <Icon className="taskbar-window-btn__icon" size={16} stroke={1.9} aria-hidden="true" />
      {!compact ? <span className="taskbar-window-btn__title">{title}</span> : null}
    </button>
  )
}
