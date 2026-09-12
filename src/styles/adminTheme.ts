// Midnight Ivory × Industrial Amber — the Admin Dashboard's own visual
// language, deliberately distinct from the public site's dark cinematic
// black/red. Every admin page/component pulls its colors from here instead
// of hardcoding hex values, so the theme stays centralized in one place.
export const admin = {
  background: '#F4F1EA',
  surface: '#FFFFFF',
  text: '#171717',
  textMuted: '#6B6B63',
  border: '#DDD9CF',
  accent: '#C77D00',
  accentDark: '#8F5900',
  success: '#287A52',
  danger: '#B43A32',
} as const

export const ADMIN_HEADING_FONT = "'Unbounded', sans-serif"
export const ADMIN_BODY_FONT = "'Inter', sans-serif"
export const ADMIN_MONO_FONT = "'IBM Plex Sans', sans-serif"
