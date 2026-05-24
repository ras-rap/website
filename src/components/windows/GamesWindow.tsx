import { useEffect, useState } from 'react'
import { IconBrandSteam, IconClockHour4, IconDeviceGamepad2, IconExternalLink, IconFolder, IconHourglassHigh } from '@tabler/icons-react'

type SteamGame = {
  appid: number
  name: string
  playtimeForeverHours: number
  playtime2WeeksHours: number
  iconUrl: string | null
}

type SteamGamesResponse = {
  games?: SteamGame[]
  error?: string
}

const formatHours = (hours: number) => `${hours.toFixed(1)}h`

export function GamesWindow() {
  const [games, setGames] = useState<SteamGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    let mounted = true

    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/steam/recent-games?count=5', {
          signal: abortController.signal,
        })
        const payload = (await response.json()) as SteamGamesResponse

        if (!response.ok) {
          throw new Error(payload.error ?? 'Steam library is currently unavailable.')
        }

        if (!mounted) {
          return
        }

        setGames(payload.games ?? [])
      } catch (caughtError) {
        if (abortController.signal.aborted || !mounted) {
          return
        }

        const message = caughtError instanceof Error ? caughtError.message : 'Steam library is currently unavailable.'
        setError(message)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchGames()

    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  return (
    <div className="games-window">
      <div className="games-window__path">
        <IconFolder size={14} stroke={1.8} />
        {'C:\\Program Files\\Steam\\userdata\\recent'}
      </div>

      {loading ? <p>Syncing with Steam library...</p> : null}
      {error ? <p className="games-window__error">{error}</p> : null}

      {!loading && !error ? (
        games.length > 0 ? (
          <div className="games-window__list" role="table" aria-label="Recent Steam games">
            <div className="games-window__row games-window__row--head" role="row">
              <span role="columnheader">Game</span>
              <span role="columnheader">All Time</span>
              <span role="columnheader">2 Weeks</span>
            </div>
            {games.map((game) => (
              <a
                key={game.appid}
                className="games-window__row games-window__row--item"
                role="row"
                href={`https://store.steampowered.com/app/${game.appid}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="games-window__title" role="cell">
                  {game.iconUrl ? (
                    <img src={game.iconUrl} alt="" className="games-window__icon" loading="lazy" />
                  ) : (
                    <span className="games-window__icon-fallback" aria-hidden="true">
                      <IconDeviceGamepad2 size={14} stroke={1.8} />
                    </span>
                  )}
                  <strong>{game.name}</strong>
                </span>
                <span className="games-window__hours" role="cell">
                  <IconHourglassHigh size={13} stroke={1.8} />
                  {formatHours(game.playtimeForeverHours)}
                </span>
                <span className="games-window__hours" role="cell">
                  <IconClockHour4 size={13} stroke={1.8} />
                  {formatHours(game.playtime2WeeksHours)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p>No recent games found on this account.</p>
        )
      ) : null}
            <div className="contact-window__links">

<a href="https://steamcommunity.com/id/Ras_rap/" target="_blank" rel="noreferrer">
          <IconBrandSteam size={14} stroke={1.8} />
          Steam
          <IconExternalLink size={14} stroke={1.8} />
        </a>
      </div>
    </div>
  )
}
