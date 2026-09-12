import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import { AdminInput, AdminTextarea, AdminCheckbox } from '../../components/admin/AdminInput'
import { AdminTableShell, AdminTh, AdminTd } from '../../components/admin/AdminTable'
import StatusBadge from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../../components/admin/LoadingState'
import { useToast } from '../../components/admin/ToastContext'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { eventService, type AdminEvent, type EventInput } from '../../services/eventService'
import { mediaService } from '../../services/mediaService'
import { getImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM: EventInput = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  eventDate: '',
  eventTime: '',
  location: '',
  registrationOpen: true,
  deadline: '',
  image: '',
  isActive: true,
}

// HTML date inputs need `YYYY-MM-DD`; stored/returned values are full ISO
// datetimes — this trims to the part <input type="date"> understands.
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminEventsPage() {
  const location = useLocation()
  const toast = useToast()

  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EventInput>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await eventService.listEvents()
    if (result.success && result.events) {
      setEvents(result.events)
      setError('')
    } else {
      setError(result.message || 'Failed to load events.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      openCreateModal()
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const openEditModal = (event: AdminEvent) => {
    setEditingId(event.id)
    setForm({
      name: event.name,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      eventDate: toDateInputValue(event.eventDate),
      eventTime: event.eventTime,
      location: event.location,
      registrationOpen: event.registrationOpen,
      deadline: toDateInputValue(event.deadline),
      image: event.image,
      isActive: event.isActive,
    })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const handleImageChange = async (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    const result = await mediaService.uploadImage('events', file)
    setUploading(false)

    if (result.success && result.url) {
      setForm((prev) => ({ ...prev, image: result.url as string }))
      toast.showSuccess('Image uploaded.')
    } else {
      toast.showError(result.message || 'Image upload failed.')
    }
    URL.revokeObjectURL(objectUrl)
    setLocalPreview(null)
  }

  const handleSave = async () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Event name is required.'
    if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required.'
    if (!form.eventDate) errors.eventDate = 'Event date is required.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    const payload: EventInput = { ...form, deadline: form.deadline || null }
    const result = editingId ? await eventService.updateEvent(editingId, payload) : await eventService.createEvent(payload)
    setSaving(false)

    if (result.success) {
      toast.showSuccess(editingId ? 'Event updated successfully.' : 'Event created successfully.')
      setModalOpen(false)
      load()
    } else {
      toast.showError(result.message || 'Failed to save event.')
    }
  }

  const handleTogglePublished = async (event: AdminEvent) => {
    const result = await eventService.updateEvent(event.id, { isActive: !event.isActive })
    if (result.success) {
      toast.showSuccess(`${event.name} ${event.isActive ? 'unpublished' : 'published'}.`)
      load()
    } else {
      toast.showError(result.message || 'Failed to update event.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await eventService.deleteEvent(deleteTarget.id)
    if (result.success) {
      toast.showSuccess('Event deleted.')
      setDeleteTarget(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete event.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          EVENTS
        </h1>
        <AdminButton onClick={openCreateModal}>
          <Plus size={14} /> ADD EVENT
        </AdminButton>
      </div>

      {loading ? (
        <LoadingState label="Loading events…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : events.length === 0 ? (
        <EmptyState label="No events found." action={<AdminButton onClick={openCreateModal}>ADD EVENT</AdminButton>} />
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTh>IMAGE</AdminTh>
              <AdminTh>NAME</AdminTh>
              <AdminTh>DATE</AdminTh>
              <AdminTh>REGISTRATION</AdminTh>
              <AdminTh>PUBLISHED</AdminTh>
              <AdminTh>ACTIONS</AdminTh>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <AdminTd>
                  <img
                    src={event.image ? getImageUrl(event.image) : '/dinobots-event-bg.jpeg'}
                    alt={event.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </AdminTd>
                <AdminTd>{event.name}</AdminTd>
                <AdminTd>{formatDate(event.eventDate)}</AdminTd>
                <AdminTd>
                  <StatusBadge active={event.registrationOpen} activeLabel="OPEN" inactiveLabel="CLOSED" />
                </AdminTd>
                <AdminTd>
                  <StatusBadge active={event.isActive} activeLabel="PUBLISHED" inactiveLabel="UNPUBLISHED" />
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(event)}
                      aria-label={`Edit ${event.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.text }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(event)}
                      aria-label={event.isActive ? `Unpublish ${event.name}` : `Publish ${event.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: event.isActive ? admin.success : admin.textMuted }}
                    >
                      <Power size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(event)}
                      aria-label={`Delete ${event.name}`}
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

      <AdminModal open={modalOpen} title={editingId ? 'EDIT EVENT' : 'ADD EVENT'} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <AdminInput
            label="Event Name"
            htmlFor="event-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
          />
          <AdminTextarea
            label="Short Description"
            htmlFor="event-short-description"
            value={form.shortDescription}
            onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
            error={formErrors.shortDescription}
          />
          <AdminTextarea
            label="Full Description"
            htmlFor="event-full-description"
            value={form.fullDescription}
            onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminInput
              label="Event Date"
              htmlFor="event-date"
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
              error={formErrors.eventDate}
            />
            <AdminInput
              label="Event Time (optional)"
              htmlFor="event-time"
              type="text"
              placeholder="e.g. 5:00 PM"
              value={form.eventTime}
              onChange={(e) => setForm((p) => ({ ...p, eventTime: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminInput
              label="Location (optional)"
              htmlFor="event-location"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
            <AdminInput
              label="Registration Deadline (optional)"
              htmlFor="event-deadline"
              type="date"
              value={form.deadline ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
              Image (optional)
            </label>
            <div className="flex items-center gap-3">
              {(localPreview || form.image) && (
                <img src={localPreview || getImageUrl(form.image)} alt="Preview" className="h-12 w-12 rounded-md object-cover" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                className="text-[12px]"
                style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
              />
              {uploading && <span className="text-[11px]" style={{ color: admin.textMuted }}>Uploading…</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <AdminCheckbox
              label="Registration Open"
              htmlFor="event-registration-open"
              checked={form.registrationOpen ?? true}
              onChange={(checked) => setForm((p) => ({ ...p, registrationOpen: checked }))}
            />
            <AdminCheckbox
              label="Published"
              htmlFor="event-active"
              checked={form.isActive ?? true}
              onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
            />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING…' : 'SAVE'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="DELETE EVENT?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
