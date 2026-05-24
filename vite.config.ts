import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type SteamRecentlyPlayedGame = {
  appid: number
  name: string
  playtime_forever: number
  playtime_2weeks?: number
}

const writeJson = (res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (chunk: string) => void }, statusCode: number, payload: unknown) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const createSteamMiddleware = () => {
  return async (
    req: { method?: string; url?: string },
    res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (chunk: string) => void },
    next: () => void,
  ) => {
    const requestUrl = req.url ?? ''

    if (!requestUrl.startsWith('/api/steam/recent-games')) {
      next()
      return
    }

    if (req.method !== 'GET') {
      writeJson(res, 405, { error: 'Method not allowed.' })
      return
    }

    const apiKey = process.env.STEAM_API_KEY?.trim()
    const steamId = (process.env.STEAM_ID ?? '76561198119046479').trim()

    if (!apiKey) {
      writeJson(res, 500, { error: 'STEAM_API_KEY is missing on the server.' })
      return
    }

    const parsedUrl = new URL(requestUrl, 'http://localhost')
    const countParam = Number(parsedUrl.searchParams.get('count') ?? '5')
    const count = Number.isFinite(countParam) ? Math.min(Math.max(Math.floor(countParam), 1), 20) : 5

    const steamRecentUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamId)}&count=${count}`

    try {
      const recentResponse = await fetch(steamRecentUrl)

      if (!recentResponse.ok) {
        throw new Error('Steam API request failed.')
      }

      const recentPayload = (await recentResponse.json()) as {
        response?: {
          games?: SteamRecentlyPlayedGame[]
        }
      }

      const recentGames = recentPayload.response?.games ?? []

      const games = await Promise.all(
        recentGames.map(async (game) => {
          let iconUrl: string | null = null

          try {
            const detailsResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&l=en`)

            if (detailsResponse.ok) {
              const detailsPayload = (await detailsResponse.json()) as Record<
                string,
                {
                  success?: boolean
                  data?: {
                    header_image?: string
                    capsule_image?: string
                  }
                }
              >
              const details = detailsPayload[String(game.appid)]
              iconUrl = details?.data?.header_image ?? details?.data?.capsule_image ?? null
            }
          } catch {
            iconUrl = null
          }

          return {
            appid: game.appid,
            name: game.name,
            playtimeForeverHours: Number((game.playtime_forever / 60).toFixed(1)),
            playtime2WeeksHours: Number(((game.playtime_2weeks ?? 0) / 60).toFixed(1)),
            iconUrl,
          }
        }),
      )

      writeJson(res, 200, {
        games,
      })
    } catch {
      writeJson(res, 502, { error: 'Could not load recent Steam games.' })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'steam-api-middleware',
      configureServer(server) {
        server.middlewares.use(createSteamMiddleware())
      },
      configurePreviewServer(server) {
        server.middlewares.use(createSteamMiddleware())
      },
    },
  ],
})
