import { loadSteamRecentGames, resolveSteamRecentGamesCount } from '../../../src/server/steamRecentGames'

type Env = {
  STEAM_API_KEY?: string
  STEAM_ID?: string
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const apiKey = env.STEAM_API_KEY?.trim()
  const steamId = (env.STEAM_ID ?? '76561198119046479').trim()

  if (!apiKey) {
    return Response.json({ error: 'STEAM_API_KEY is missing on the server.' }, { status: 500 })
  }

  const requestUrl = new URL(request.url)
  const count = resolveSteamRecentGamesCount(requestUrl.searchParams.get('count'))

  try {
    const result = await loadSteamRecentGames({ apiKey, steamId, count })
    return Response.json(result)
  } catch {
    return Response.json({ error: 'Could not load recent Steam games.' }, { status: 502 })
  }
}

export function onRequest() {
  return Response.json({ error: 'Method not allowed.' }, { status: 405 })
}