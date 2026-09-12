// Real admin authentication against the Dinobots backend. The JWT lives
// only in the server-set HTTP-only cookie — this file never reads, writes,
// or stores it (no localStorage/sessionStorage); `credentials: 'include'`
// is what makes the browser send/receive that cookie on every request.
import { API_BASE_URL } from '../config/api'

export interface AdminUser {
  id: string
  email: string
  role: string
}

export interface AuthResult {
  success: boolean
  admin?: AdminUser
  message?: string
}

async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return { success: false, message: data.message }
    }

    return { success: true, admin: data.admin }
  } catch {
    // Network failure / backend unreachable — never surface the raw error.
    return { success: false, message: 'Unable to reach the server. Please try again.' }
  }
}

async function signOut(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Best-effort — if this fails, the cookie simply expires on its own.
  }
}

// The JWT cookie is HTTP-only, so the frontend has no way to check auth
// state synchronously/locally — it has to ask the backend.
async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
      credentials: 'include',
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.admin ?? null
  } catch {
    return null
  }
}

export const authService = { signIn, signOut, getCurrentAdmin }
