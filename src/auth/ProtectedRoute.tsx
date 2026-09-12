import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface ProtectedRouteProps {
  children: ReactNode
}

// Gate for any route that requires an authenticated admin session — today
// only `/admin`. The JWT lives in an HTTP-only cookie, so it can't be read
// from JS/local state — the only way to know if it's valid is to ask the
// backend (GET /api/admin/me), hence the brief "checking" state below.
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')

  useEffect(() => {
    let cancelled = false

    authService.getCurrentAdmin().then((admin) => {
      if (!cancelled) setStatus(admin ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') {
    return <div style={{ minHeight: '100dvh', width: '100%', backgroundColor: '#060606' }} />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
