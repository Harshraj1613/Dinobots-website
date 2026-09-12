import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export default function StatusBadge({ active, activeLabel = 'ACTIVE', inactiveLabel = 'INACTIVE' }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{
        fontFamily: ADMIN_BODY_FONT,
        borderColor: active ? admin.success : admin.border,
        color: active ? admin.success : admin.textMuted,
        backgroundColor: active ? 'rgba(40,122,82,0.08)' : 'transparent',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? admin.success : admin.textMuted }} />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

const JOIN_STATUS_COLOR: Record<string, string> = {
  pending: admin.accent,
  reviewed: '#2C6E9E',
  accepted: admin.success,
  rejected: admin.danger,
}

export function JoinStatusBadge({ status }: { status: string }) {
  const color = JOIN_STATUS_COLOR[status] || admin.textMuted
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{ fontFamily: ADMIN_BODY_FONT, borderColor: color, color, backgroundColor: 'transparent' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {status}
    </span>
  )
}
