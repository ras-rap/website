import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadSteamRecentGames, resolveSteamRecentGamesCount } from './src/server/steamRecentGames'

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
    const count = resolveSteamRecentGamesCount(parsedUrl.searchParams.get('count'))

    try {
      const result = await loadSteamRecentGames({ apiKey, steamId, count })
      writeJson(res, 200, result)
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
