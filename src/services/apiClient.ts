// Shared fetch helper for every service in this folder — centralizes the
// API base URL, `credentials: 'include'` (so the HTTP-only JWT cookie is
// always sent/received), and JSON parsing/error shape. No service file
// should call `fetch` directly or hardcode the backend URL itself.
import { API_BASE_URL } from '../config/api'

export interface ApiResult {
  success: boolean
  message?: string
  errors?: Record<string, string>
  [key: string]: unknown
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult & T> {
  try {
    const isFormData = options.body instanceof FormData
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: isFormData
        ? options.headers
        : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })

    const data = (await response.json().catch(() => ({}))) as ApiResult & T

    if (!response.ok && data.success === undefined) {
      return { success: false, message: 'Request failed.' } as ApiResult & T
    }

    return data
  } catch {
    return { success: false, message: 'Unable to reach the server. Please try again.' } as ApiResult & T
  }
}

export const apiGet = <T = unknown>(path: string) => apiFetch<T>(path)

export const apiPost = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) })

export const apiPut = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) })

export const apiPatch = <T = unknown>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) })

export const apiDelete = <T = unknown>(path: string) => apiFetch<T>(path, { method: 'DELETE' })
