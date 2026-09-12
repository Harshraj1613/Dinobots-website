import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 py-10 text-sm"
      style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
    >
      <span
        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        style={{ color: admin.accent }}
        aria-hidden="true"
      />
      {label}
    </div>
  )
}

export function EmptyState({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center text-sm"
      style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted, borderColor: admin.border }}
    >
      <span>{label}</span>
      {action}
    </div>
  )
}

export function ErrorState({ label }: { label: string }) {
  return (
    <div
      className="rounded-lg border py-4 px-4 text-sm"
      style={{ fontFamily: ADMIN_BODY_FONT, color: admin.danger, borderColor: admin.danger, backgroundColor: 'rgba(180,58,50,0.06)' }}
    >
      {label}
    </div>
  )
}
