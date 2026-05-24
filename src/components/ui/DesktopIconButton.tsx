import type { AppIconComponent } from '../../desktopData'

export function DesktopIconButton({
  title,
  icon,
  selected,
  compact,
  onSelect,
  onOpen,
}: {
  title: string
  icon: AppIconComponent
  selected: boolean
  compact: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  const Icon = icon

  return (
    <button
      type="button"
      className={`desktop-icon${selected ? ' is-selected' : ''}`}
      aria-label={`${title}${compact ? ' (tap to open)' : ' (double-click to open)'}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onOpen()
      }}
    >
      <Icon className="desktop-icon__emoji" size={36} stroke={1.75} aria-hidden />
      <span className="desktop-icon__label">{title}</span>
    </button>
  )
}
