import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

type ToastKind = 'success' | 'error'

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const value: ToastContextValue = {
    showSuccess: (message) => push('success', message),
    showError: (message) => push('error', message),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="rounded-lg border px-4 py-3 text-sm shadow-[0_8px_24px_rgba(23,23,23,0.12)]"
            style={{
              fontFamily: ADMIN_BODY_FONT,
              backgroundColor: admin.surface,
              borderColor: toast.kind === 'success' ? admin.success : admin.danger,
              color: admin.text,
            }}
          >
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: toast.kind === 'success' ? admin.success : admin.danger }}
            />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within AdminToastProvider')
  return ctx
}
