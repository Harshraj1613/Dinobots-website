import { API_BASE_URL } from '../config/api'

// Single source of truth for turning a stored `image` value into a URL a
// browser can actually load. CMS-uploaded images are saved to the BACKEND's
// disk and returned/stored as a path relative to the backend (e.g.
// "/uploads/team/xxx.jpg") — rendered as-is, the browser resolves that
// against the current page origin (the frontend, e.g. localhost:5173) and
// gets Vite's SPA fallback (200 text/html) instead of the image, which is
// exactly what shows up as a broken-image icon. Static site assets under
// /public (e.g. "/dinobots-team-bg.jpeg") are correct as-is against the
// frontend origin and must be left untouched.
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return ''
  const trimmed = imagePath.trim()
  if (!trimmed) return ''

  // Already absolute (http(s) URL or a data: URI) — nothing to do.
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed

  // Backend-relative upload path, with or without a leading slash.
  if (trimmed.startsWith('/uploads/')) return `${API_BASE_URL}${trimmed}`
  if (trimmed.startsWith('uploads/')) return `${API_BASE_URL}/${trimmed}`

  // Anything else is a frontend /public static asset — resolve as-is.
  return trimmed
}
