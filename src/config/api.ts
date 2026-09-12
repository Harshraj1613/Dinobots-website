// Single source of truth for the backend's base URL — every service that
// talks to the API imports this instead of hardcoding the URL itself.
// Override via VITE_API_BASE_URL (a plain config value, never a secret) if
// the backend ever runs somewhere other than localhost:5000.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
