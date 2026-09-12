import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { admin, ADMIN_HEADING_FONT } from '../../styles/adminTheme'

interface AdminModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}

export default function AdminModal({ open, title, onClose, children, maxWidth = '560px' }: AdminModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border shadow-[0_24px_60px_rgba(23,23,23,0.25)]"
        style={{ maxWidth, backgroundColor: admin.surface, borderColor: admin.border }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: admin.border }}>
          <h2
            className="text-sm font-bold uppercase tracking-[0.08em]"
            style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none transition-colors duration-150 hover:bg-black/5"
            style={{ color: admin.textMuted }}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
