import type { ReactNode } from 'react'

export function WindowShell({
  title,
  showMenuBar,
  showViewMenu,
  onMinimize,
  onClose,
  children,
}: {
  title: string
  showMenuBar: boolean
  showViewMenu?: boolean
  onMinimize: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <section className="window__frame" aria-label={`${title} window`}>
      <header className="window__titlebar">
        <div className="window__title-group">
          <span className="window__badge" aria-hidden="true">
            ■
          </span>
          <span>{title}</span>
        </div>
        <div
          className="window__controls"
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="window__control"
            aria-label={`Minimize ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={onMinimize}
          >
            _
          </button>
          <button
            type="button"
            className="window__control"
            aria-label={`Close ${title}`}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </header>

      {showMenuBar ? (
        <div className="window__menu-bar">
          <span>File</span>
          {showViewMenu ? <span>View</span> : null}
          <span>Help</span>
        </div>
      ) : null}

      <div className="window__content">{children}</div>
    </section>
  )
}
