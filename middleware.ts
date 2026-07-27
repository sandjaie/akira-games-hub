/**
 * Vercel Routing Middleware — HTTP Basic Auth for the whole site.
 * Set SITE_USER and SITE_PASSWORD in the Vercel project env vars.
 * If either is missing, the gate is skipped (handy for local Vite play).
 */
export const config = {
  matcher: '/:path*',
}

function env(name: string): string | undefined {
  // Vercel injects these at the edge; typed lightly to avoid Node types in middleware.
  return (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[name]
}

export default function middleware(request: Request): Response | undefined {
  const user = env('SITE_USER')
  const pass = env('SITE_PASSWORD')

  if (!user || !pass) {
    return undefined
  }

  const header = request.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6))
      const colon = decoded.indexOf(':')
      const u = decoded.slice(0, colon)
      const p = decoded.slice(colon + 1)
      if (u === user && p === pass) {
        return undefined
      }
    } catch {
      // fall through to 401
    }
  }

  return new Response('Akira’s games need a password.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Akira Games Hub"',
      'Cache-Control': 'no-store',
    },
  })
}
