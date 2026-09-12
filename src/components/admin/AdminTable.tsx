import type { ReactNode } from 'react'
import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

// Thin styling shell around a plain <table> — horizontal scroll only
// kicks in when the table itself is wider than its container, never a
// second nested vertical scrollbar.
export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: admin.border }}>
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px]" style={{ fontFamily: ADMIN_BODY_FONT }}>
        {children}
      </table>
    </div>
  )
}

export function AdminTh({ children }: { children: ReactNode }) {
  return (
    <th
      className="border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ borderColor: admin.border, color: admin.textMuted, backgroundColor: '#FAF8F3' }}
    >
      {children}
    </th>
  )
}

export function AdminTd({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`border-b px-4 py-3 align-middle ${className}`} style={{ borderColor: admin.border, color: admin.text }}>
      {children}
    </td>
  )
}
