import { useEffect, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { AdminTableShell, AdminTh, AdminTd } from '../../components/admin/AdminTable'
import { JoinStatusBadge } from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../../components/admin/LoadingState'
import { useToast } from '../../components/admin/ToastContext'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import {
  eventJoinRequestService,
  type AdminEventJoinRequest,
  type EventJoinRequestStatus,
} from '../../services/eventJoinRequestService'

const STATUSES: EventJoinRequestStatus[] = ['pending', 'approved', 'rejected']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminEventJoinRequestsPage() {
  const toast = useToast()
  const [requests, setRequests] = useState<AdminEventJoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<EventJoinRequestStatus | 'all'>('all')

  const [viewing, setViewing] = useState<AdminEventJoinRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminEventJoinRequest | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await eventJoinRequestService.listEventJoinRequests()
    if (result.success && result.requests) {
      setRequests(result.requests)
      setError('')
    } else {
      setError(result.message || 'Failed to load event join requests.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (request: AdminEventJoinRequest, status: EventJoinRequestStatus) => {
    setUpdatingId(request.id)
    const result = await eventJoinRequestService.updateStatus(request.id, status)
    setUpdatingId(null)
    if (result.success) {
      toast.showSuccess(`Marked "${request.fullName}" as ${status}.`)
      load()
      if (viewing?.id === request.id && result.request) setViewing(result.request)
    } else {
      toast.showError(result.message || 'Failed to update status.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await eventJoinRequestService.deleteEventJoinRequest(deleteTarget.id)
    if (result.success) {
      toast.showSuccess('Event join request deleted.')
      setDeleteTarget(null)
      setViewing(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete event join request.')
    }
  }

  const visibleRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          EVENT JOIN REQUESTS
        </h1>
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
              style={{
                fontFamily: ADMIN_BODY_FONT,
                borderColor: filter === s ? admin.accent : admin.border,
                color: filter === s ? admin.accentDark : admin.textMuted,
                backgroundColor: filter === s ? 'rgba(199,125,0,0.08)' : 'transparent',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading event join requests…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : visibleRequests.length === 0 ? (
        <EmptyState label="No event join requests found." />
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTh>EVENT</AdminTh>
              <AdminTh>NAME</AdminTh>
              <AdminTh>EMAIL</AdminTh>
              <AdminTh>PHONE</AdminTh>
              <AdminTh>YEAR</AdminTh>
              <AdminTh>BRANCH</AdminTh>
              <AdminTh>STATUS</AdminTh>
              <AdminTh>DATE</AdminTh>
              <AdminTh>ACTIONS</AdminTh>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.map((request) => (
              <tr key={request.id}>
                <AdminTd>{request.eventName}</AdminTd>
                <AdminTd>{request.fullName}</AdminTd>
                <AdminTd>{request.email}</AdminTd>
                <AdminTd>{request.phone}</AdminTd>
                <AdminTd>{request.year}</AdminTd>
                <AdminTd>{request.branch}</AdminTd>
                <AdminTd>
                  <JoinStatusBadge status={request.status} />
                </AdminTd>
                <AdminTd>{formatDate(request.createdAt)}</AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewing(request)}
                      aria-label={`View ${request.fullName}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.text }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(request)}
                      aria-label={`Delete ${request.fullName}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.danger }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}

      <AdminModal open={!!viewing} title="EVENT JOIN REQUEST" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="flex flex-col gap-4 text-sm" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Event</div>
                <div>{viewing.eventName}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Name</div>
                <div>{viewing.fullName}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Email</div>
                <div>{viewing.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Phone</div>
                <div>{viewing.phone}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Year</div>
                <div>{viewing.year}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Branch</div>
                <div>{viewing.branch}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>College / Institute</div>
                <div>{viewing.college}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Area of Interest</div>
                <div>{viewing.areaOfInterest}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Submitted</div>
                <div>{formatDate(viewing.createdAt)}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Message</div>
              <p className="mt-1 leading-relaxed">{viewing.message}</p>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: admin.textMuted }}>Status</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingId === viewing.id}
                    onClick={() => handleStatusChange(viewing, status)}
                    className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-50"
                    style={{
                      fontFamily: ADMIN_BODY_FONT,
                      borderColor: viewing.status === status ? admin.accent : admin.border,
                      color: viewing.status === status ? admin.accentDark : admin.textMuted,
                      backgroundColor: viewing.status === status ? 'rgba(199,125,0,0.08)' : 'transparent',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="DELETE EVENT JOIN REQUEST?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
