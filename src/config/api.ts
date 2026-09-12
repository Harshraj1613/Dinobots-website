// Single source of truth for the backend's base URL — every service that
// talks to the API imports this instead of hardcoding the URL itself.
// Override via VITE_API_BASE_URL (a plain config value, never a secret) if
// the backend ever runs somewhere other than localhost:5000.
//
// The `localhost:5000` fallback is deliberately DEV-only (`import.meta.env.DEV`).
// Vite inlines VITE_* values at BUILD time, not runtime — if a production
// build is ever run without VITE_API_BASE_URL actually set (e.g. the env
// var was added on the host after the last build, or scoped to the wrong
// environment), falling back to localhost would silently point a deployed
// site at a machine that doesn't exist, surfacing only as a generic
// "Unable to reach the server" with no clue why. Falling back to '' instead
// keeps requests same-origin (a debuggable 404/parse failure) and the
// console.error below names the actual missing configuration outright.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')

if (!import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.error(
    'VITE_API_BASE_URL is not set in this production build. Set it for the Production environment in your host (e.g. Vercel) and redeploy — API requests will otherwise fail.',
  )
}
