import { forwardRef } from 'react'
import { Menu, Search, Bell } from 'lucide-react'
import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'
import type { AdminUser } from '../../services/authService'

interface AdminHeaderProps {
  admin_: AdminUser | null
  systemOnline: boolean
  onOpenDrawer: () => void
  pendingJoinRequests: number
}

// Forwards its own ref to the rendered <header> so AdminLayout can measure
// its real, live height (ResizeObserver) instead of any page guessing a
// fixed pixel offset for "the rest of the viewport below the header".
const AdminHeader = forwardRef<HTMLElement, AdminHeaderProps>(function AdminHeader(
  { admin_, systemOnline, onOpenDrawer, pendingJoinRequests },
  ref,
) {
  const initials = admin_?.email ? admin_.email.slice(0, 2).toUpperCase() : 'AD'

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 lg:px-6"
      style={{ backgroundColor: admin.surface, borderColor: admin.border }}
    >
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-md border lg:hidden"
        style={{ borderColor: admin.border, color: admin.text }}
      >
        <Menu size={17} />
      </button>

      <div className="relative flex-1 max-w-[360px]">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: admin.textMuted }} />
        <input
          type="search"
          placeholder="Search…"
          disabled
          aria-label="Search"
          className="w-full rounded-md border py-2 pl-9 pr-3 text-[13px] outline-none disabled:opacity-70"
          style={{ borderColor: admin.border, fontFamily: ADMIN_BODY_FONT, color: admin.text, backgroundColor: '#FAF8F3' }}
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div
          className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] sm:flex"
          style={{
            borderColor: admin.border,
            color: systemOnline ? admin.success : admin.danger,
            fontFamily: ADMIN_BODY_FONT,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: systemOnline ? admin.success : admin.danger }}
          />
          {systemOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
        </div>

        <div className="relative" title={`${pendingJoinRequests} pending join request(s)`}>
          <Bell size={17} style={{ color: admin.textMuted }} />
          {pendingJoinRequests > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
              style={{ backgroundColor: admin.accent }}
            >
              {pendingJoinRequests > 9 ? '9+' : pendingJoinRequests}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: admin.accentDark, fontFamily: ADMIN_BODY_FONT }}
          >
            {initials}
          </span>
          <div className="hidden leading-tight sm:block">
            <div className="text-[12px] font-semibold" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>
              {admin_?.email ?? '—'}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.08em]"
              style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
            >
              {admin_?.role ?? 'admin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})

export default AdminHeader
