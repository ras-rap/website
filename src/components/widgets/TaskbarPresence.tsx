import { type LanyardData } from '../../desktopData'
import { formatDiscordStatus, formatDuration } from '../../desktopUtils'

export function TaskbarPresence({
  configured,
  loading,
  error,
  lanyardData,
  now,
  open,
  setOpen,
  onRefresh,
}: {
  configured: boolean
  loading: boolean
  error: string | null
  lanyardData: LanyardData | null
  now: number
  open: boolean
  setOpen: (open: boolean) => void
  onRefresh: () => void
}) {
  const activity = lanyardData?.activities.find((entry) => entry.type === 0 && entry.name !== 'Spotify') ?? null
  const spotify = lanyardData?.spotify ?? null
  const status = lanyardData?.discord_status ?? 'offline'
  const statusLabel = configured ? formatDiscordStatus(status) : 'Not configured'
  const spotifyProgress =
    spotify && spotify.timestamps.end > spotify.timestamps.start
      ? Math.min(
          100,
          Math.max(0, ((now - spotify.timestamps.start) / (spotify.timestamps.end - spotify.timestamps.start)) * 100),
        )
      : 0

  return (
    <div
      className={`taskbar-presence is-${status}`}
      onMouseEnter={() => {
        setOpen(true)
        onRefresh()
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="taskbar-presence__chip"
        aria-label={`Discord status: ${statusLabel}`}
        aria-expanded={open}
        onFocus={() => {
          setOpen(true)
          onRefresh()
        }}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.stopPropagation()
          setOpen(!open)
        }}
      >
        <span className="taskbar-presence__dot" aria-hidden="true" />
        <span className="taskbar-presence__label">Discord</span>
        <span className="taskbar-presence__status">{statusLabel}</span>
      </button>

      {open ? (
        <div className="taskbar-presence__popover" role="tooltip" aria-label="Discord presence">
          {!configured ? (
            <div className="taskbar-presence__empty">
              <strong>Discord presence</strong>
              <p>Add <code>VITE_DISCORD_USER_ID</code> to show live activity here.</p>
            </div>
          ) : loading ? (
            <p>Connecting to Lanyard...</p>
          ) : error ? (
            <p>{error}</p>
          ) : lanyardData ? (
            <>
              <div className="taskbar-presence__header">
                <div className="taskbar-presence__status-copy">
                  <span className={`taskbar-presence__dot is-${status}`} aria-hidden="true" />
                  <div>
                    <strong>{statusLabel}</strong>
                    <p>{activity ? activity.name : 'Discord is idle'}</p>
                  </div>
                </div>
              </div>

              {spotify ? (
                <div className="taskbar-presence__spotify">
                  <img
                    className="taskbar-presence__album-art"
                    src={spotify.album_art_url}
                    alt={`${spotify.song} album art`}
                  />
                  <div className="taskbar-presence__spotify-body">
                    <strong>{spotify.song}</strong>
                    <span>{spotify.artist}</span>
                    <div className="taskbar-presence__progress-row">
                      <div className="taskbar-presence__progress">
                        <div className="taskbar-presence__progress-fill" style={{ width: `${spotifyProgress}%` }} />
                      </div>
                      <div className="taskbar-presence__progress-labels">
                        <span>{formatDuration(now - spotify.timestamps.start)}</span>
                        <span>{formatDuration(spotify.timestamps.end - now)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activity ? (
                <div className="taskbar-presence__activity">
                  <strong>Current activity</strong>
                  {activity.details ? <p>{activity.details}</p> : null}
                  {activity.state ? <span>{activity.state}</span> : null}
                </div>
              ) : null}
            </>
          ) : (
            <p>No activity data available yet.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
