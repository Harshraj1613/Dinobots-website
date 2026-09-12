import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FolderKanban, Trophy, Inbox, Plus, Calendar, ClipboardList } from 'lucide-react'
import AdminCard from '../../components/admin/AdminCard'
import { LoadingState, ErrorState } from '../../components/admin/LoadingState'
import AdminButton from '../../components/admin/AdminButton'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { dashboardService, type DashboardStats } from '../../services/dashboardService'
import { activityService, type ActivityEntry } from '../../services/activityService'
import { teamService, type AdminTeamMember } from '../../services/teamService'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STAT_CARDS = [
  { key: 'members' as const, label: 'TOTAL MEMBERS', icon: Users },
  { key: 'projects' as const, label: 'TOTAL PROJECTS', icon: FolderKanban },
  { key: 'achievements' as const, label: 'ACHIEVEMENTS', icon: Trophy },
  { key: 'pendingJoinRequests' as const, label: 'JOIN REQUESTS', icon: Inbox },
  { key: 'events' as const, label: 'ACTIVE EVENTS', icon: Calendar },
  { key: 'pendingEventJoinRequests' as const, label: 'EVENT JOIN REQUESTS', icon: ClipboardList },
]

export default function AdminDashboardHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [members, setMembers] = useState<AdminTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [statsResult, activityResult, teamResult] = await Promise.all([
        dashboardService.getStats(),
        activityService.getRecent(),
        teamService.listTeam(),
      ])
      if (cancelled) return

      if (statsResult.success && statsResult.stats) setStats(statsResult.stats)
      else setError(statsResult.message || 'Failed to load dashboard statistics.')

      if (activityResult.success && activityResult.activities) setActivities(activityResult.activities)
      if (teamResult.success && teamResult.team) setMembers(teamResult.team)

      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingState label="Loading dashboard…" />

  return (
    // `lg:min-h-[...]` targets "the rest of the viewport below the header"
    // using the real, measured header height AdminLayout exposes as
    // `--admin-header-h` (see AdminLayout.tsx), minus this <main>'s own
    // `lg:py-8` (2rem top + 2rem bottom = 4rem) — not a guessed pixel
    // offset, both terms are the actual values already in play. It's a
    // floor, not a cap: the flex column can still grow taller than this on
    // its own if content genuinely needs more room (see the activity/team
    // row below), which is what lets the page fall back to normal document
    // scrolling instead of ever clipping anything.
    <div className="flex flex-col gap-8 lg:min-h-[calc(100dvh-var(--admin-header-h,64px)-4rem)]">
      <div>
        <h1
          className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold uppercase leading-tight tracking-tight"
          style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
        >
          WELCOME BACK,
          <br />
          ADMIN
        </h1>
        <p className="mt-1 text-sm" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
          Here's what's happening with Dinobots.
        </p>
      </div>

      {error && <ErrorState label={error} />}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <AdminCard key={card.key}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
                >
                  {card.label}
                </span>
                <card.icon size={16} style={{ color: admin.accent }} />
              </div>
              <div
                className="mt-3 text-3xl font-extrabold"
                style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
              >
                {stats[card.key]}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* `lg:flex-1` lets this row claim whatever's left of the min-height
          above once the welcome heading + stats cards have taken their
          natural space — a single-row grid stretches to fill a taller
          container by default, so Recent Activity/Team Overview grow to
          match each other and the available space with no extra height
          rules needed. If their content is ever taller than that available
          space, flexbox's default min-height:auto keeps them from being
          compressed/clipped — the row (and the page) simply grows past the
          viewport and normal document scrolling takes over. */}
      <div className="grid grid-cols-1 gap-5 lg:flex-1 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <h2
            className="text-xs font-bold uppercase tracking-[0.1em]"
            style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
          >
            RECENT ACTIVITY
          </h2>
          {activities.length === 0 ? (
            <p className="mt-3 text-sm" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
              No activity yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y" style={{ borderColor: admin.border }}>
              {activities.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[13px]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>
                    {a.message}
                  </span>
                  <span
                    className="shrink-0 text-[11px]"
                    style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
                  >
                    {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard>
          <h2
            className="text-xs font-bold uppercase tracking-[0.1em]"
            style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
          >
            TEAM OVERVIEW
          </h2>
          <p className="mt-3 text-sm" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
            {members.filter((m) => m.isActive).length} active · {members.filter((m) => !m.isActive).length} inactive
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {members.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between text-[13px]">
                <span style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>{m.name}</span>
                <span
                  className="text-[10px] uppercase tracking-[0.06em]"
                  style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
                >
                  {m.post}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <AdminCard>
        <h2
          className="text-xs font-bold uppercase tracking-[0.1em]"
          style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
        >
          QUICK ACTIONS
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <AdminButton onClick={() => navigate('/admin/team', { state: { openCreate: true } })}>
            <Plus size={14} /> ADD TEAM MEMBER
          </AdminButton>
          <AdminButton onClick={() => navigate('/admin/projects', { state: { openCreate: true } })}>
            <Plus size={14} /> ADD PROJECT
          </AdminButton>
          <AdminButton onClick={() => navigate('/admin/achievements', { state: { openCreate: true } })}>
            <Plus size={14} /> ADD ACHIEVEMENT
          </AdminButton>
          <AdminButton onClick={() => navigate('/admin/events', { state: { openCreate: true } })}>
            <Plus size={14} /> ADD EVENT
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate('/admin/join-requests')}>
            VIEW JOIN REQUESTS
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => navigate('/admin/event-join-requests')}>
            VIEW EVENT JOIN REQUESTS
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  )
}
