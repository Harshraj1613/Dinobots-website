import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { AdminToastProvider } from './ToastContext'
import { admin } from '../../styles/adminTheme'
import { authService, type AdminUser } from '../../services/authService'
import { dashboardService } from '../../services/dashboardService'
import { API_BASE_URL } from '../../config/api'

// Persistent chrome for every /admin/* page once authenticated — sidebar +
// header stay mounted across navigation, only <Outlet/> swaps.
export default function AdminLayout() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [systemOnline, setSystemOnline] = useState(true)
  const [pendingJoinRequests, setPendingJoinRequests] = useState(0)

  // Measured (not guessed) header height, exposed to every admin page below
  // as `--admin-header-h` so a page (e.g. Dashboard) can size itself to
  // "the rest of the viewport" via `calc(100dvh - var(--admin-header-h))`
  // without hardcoding a pixel offset that would drift the moment the
  // header's own content changes.
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setHeaderHeight(entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    authService.getCurrentAdmin().then(setCurrentAdmin)

    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => setSystemOnline(res.ok))
      .catch(() => setSystemOnline(false))

    dashboardService.getStats().then((result) => {
      if (result.success && result.stats) setPendingJoinRequests(result.stats.pendingJoinRequests)
    })
  }, [])

  // Scopes the admin-page rules in index.css (`html.admin-page`) to exactly
  // the admin shell — added to <html> only while it's mounted, removed on
  // unmount, same pattern as `.join-us-page` in JoinUs.tsx. See that CSS
  // block for why this needs to force `overflow-y: auto`, not just hide the
  // scrollbar: it guards the whole admin section against ever inheriting a
  // stuck `overflow: hidden` from the homepage's cinematic scroll lock.
  useEffect(() => {
    document.documentElement.classList.add('admin-page')
    return () => {
      document.documentElement.classList.remove('admin-page')
    }
  }, [])

  const handleLogOut = async () => {
    await authService.signOut()
    navigate('/admin/login')
  }

  return (
    <AdminToastProvider>
      <div className="flex min-h-[100dvh] w-full" style={{ backgroundColor: admin.background }}>
        <AdminSidebar onLogOut={handleLogOut} drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
        <div className="flex min-h-[100dvh] w-full flex-1 flex-col">
          <AdminHeader
            ref={headerRef}
            admin_={currentAdmin}
            systemOnline={systemOnline}
            onOpenDrawer={() => setDrawerOpen(true)}
            pendingJoinRequests={pendingJoinRequests}
          />
          <main
            className="flex-1 px-4 py-6 lg:px-8 lg:py-8"
            style={{ '--admin-header-h': `${headerHeight}px` } as CSSProperties}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </AdminToastProvider>
  )
}
