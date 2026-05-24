export function DesktopIconButton({
  title,
  icon,
  selected,
  compact,
  onSelect,
  onOpen,
}: {
  title: string
  icon: string
  selected: boolean
  compact: boolean
  onSelect: () => void
  onOpen: () => void
}) {
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
      <span className="desktop-icon__emoji" aria-hidden="true">
        {icon}
      </span>
      <span className="desktop-icon__label">{title}</span>
    </button>
  )
}
