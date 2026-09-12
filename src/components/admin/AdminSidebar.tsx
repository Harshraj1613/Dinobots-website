import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Trophy,
  Inbox,
  Calendar,
  ClipboardList,
  Image as ImageIcon,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react'
import { admin, ADMIN_HEADING_FONT, ADMIN_BODY_FONT } from '../../styles/adminTheme'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'DASHBOARD', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'TEAM', to: '/admin/team', icon: Users },
  { label: 'PROJECTS', to: '/admin/projects', icon: FolderKanban },
  { label: 'ACHIEVEMENTS', to: '/admin/achievements', icon: Trophy },
  { label: 'EVENTS', to: '/admin/events', icon: Calendar },
  { label: 'JOIN REQUESTS', to: '/admin/join-requests', icon: Inbox },
  { label: 'EVENT JOIN REQUESTS', to: '/admin/event-join-requests', icon: ClipboardList },
  { label: 'MEDIA', to: '/admin/media', icon: ImageIcon },
  { label: 'SETTINGS', to: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  onLogOut: () => void
  onNavigate?: () => void
}

function SidebarContent({ onLogOut, onNavigate }: AdminSidebarProps) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: admin.surface }}>
      <div className="flex items-center gap-2 border-b px-5 py-5" style={{ borderColor: admin.border }}>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-extrabold text-white"
          style={{ backgroundColor: admin.accent, fontFamily: ADMIN_HEADING_FONT }}
        >
          D
        </span>
        <span
          className="text-sm font-extrabold uppercase tracking-[0.12em]"
          style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
        >
          DINOBOTS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 ${
                    isActive ? '' : 'hover:bg-black/[0.03]'
                  }`
                }
                style={({ isActive }) => ({
                  fontFamily: ADMIN_BODY_FONT,
                  backgroundColor: isActive ? 'rgba(199,125,0,0.1)' : 'transparent',
                  color: isActive ? admin.accentDark : admin.textMuted,
                  borderLeft: isActive ? `2px solid ${admin.accent}` : '2px solid transparent',
                })}
              >
                <item.icon size={15} strokeWidth={2} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t px-3 py-4" style={{ borderColor: admin.border }}>
        <button
          type="button"
          onClick={onLogOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 hover:bg-black/[0.03]"
          style={{ fontFamily: ADMIN_BODY_FONT, color: admin.danger }}
        >
          <LogOut size={15} strokeWidth={2} />
          LOG OUT
        </button>
      </div>
    </div>
  )
}

// Desktop: fixed, always visible. Mobile/tablet: slide-in drawer, only
// rendered/interactive while `drawerOpen`.
export default function AdminSidebar({
  onLogOut,
  drawerOpen,
  onCloseDrawer,
}: AdminSidebarProps & { drawerOpen: boolean; onCloseDrawer: () => void }) {
  return (
    <>
      <aside
        className="hidden w-[240px] shrink-0 border-r lg:block"
        style={{ borderColor: admin.border }}
      >
        <div className="sticky top-0 h-[100dvh]">
          <SidebarContent onLogOut={onLogOut} />
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseDrawer} aria-hidden="true" />
          <div className="relative h-full w-[260px] border-r shadow-xl" style={{ borderColor: admin.border }}>
            <button
              type="button"
              onClick={onCloseDrawer}
              aria-label="Close navigation"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md"
              style={{ color: admin.textMuted }}
            >
              <X size={16} />
            </button>
            <SidebarContent onLogOut={onLogOut} onNavigate={onCloseDrawer} />
          </div>
        </div>
      )}
    </>
  )
}
