export function TaskbarWindowButton({
  icon,
  title,
  active,
  onClick,
}: {
  icon: string
  title: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`taskbar-window-btn${active ? ' is-active' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      {icon} {title}
    </button>
  )
}
