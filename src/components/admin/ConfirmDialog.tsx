import { createPortal } from 'react-dom'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import AdminButton from './AdminButton'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  description = 'This action cannot be undone.',
  confirmLabel = 'DELETE',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-[380px] rounded-xl border p-5 shadow-[0_24px_60px_rgba(23,23,23,0.25)]"
        style={{ backgroundColor: admin.surface, borderColor: admin.border }}
      >
        <h2
          className="text-sm font-bold uppercase tracking-[0.06em]"
          style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
        >
          {title}
        </h2>
        <p className="mt-2 text-[13px]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton variant="secondary" onClick={onCancel}>
            CANCEL
          </AdminButton>
          <AdminButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>,
    document.body
  )
}
