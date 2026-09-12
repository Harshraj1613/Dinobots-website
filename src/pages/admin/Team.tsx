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
import { teamService, type AdminTeamMember, type TeamMemberInput } from '../../services/teamService'
import { mediaService } from '../../services/mediaService'
import { getImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM: TeamMemberInput = { name: '', post: '', description: '', image: '', order: 0, isActive: true }

export default function AdminTeamPage() {
  const location = useLocation()
  const toast = useToast()

  const [members, setMembers] = useState<AdminTeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamMemberInput>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<AdminTeamMember | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await teamService.listTeam()
    if (result.success && result.team) {
      setMembers(result.team)
      setError('')
    } else {
      setError(result.message || 'Failed to load team members.')
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
    setForm({ ...EMPTY_FORM, order: members.length + 1 })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const openEditModal = (member: AdminTeamMember) => {
    setEditingId(member.id)
    setForm({
      name: member.name,
      post: member.post,
      description: member.description,
      image: member.image,
      order: member.order,
      isActive: member.isActive,
    })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const handleImageChange = async (file: File) => {
    // Instant local preview (object URL) while the upload is in flight, so
    // the picker never shows a broken/blank state between "file chosen" and
    // "server responded" — replaced by the real server URL once it lands.
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    const result = await mediaService.uploadImage('team', file)
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
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (!form.post.trim()) errors.post = 'Post is required.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    const result = editingId
      ? await teamService.updateTeamMember(editingId, form)
      : await teamService.createTeamMember(form)
    setSaving(false)

    if (result.success) {
      toast.showSuccess(editingId ? 'Team member updated successfully.' : 'Team member created successfully.')
      setModalOpen(false)
      load()
    } else {
      toast.showError(result.message || 'Failed to save team member.')
    }
  }

  const handleToggleStatus = async (member: AdminTeamMember) => {
    const result = await teamService.patchTeamStatus(member.id, !member.isActive)
    if (result.success) {
      toast.showSuccess(`${member.name} ${member.isActive ? 'deactivated' : 'activated'}.`)
      load()
    } else {
      toast.showError(result.message || 'Failed to update status.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await teamService.deleteTeamMember(deleteTarget.id)
    if (result.success) {
      toast.showSuccess('Team member deleted.')
      setDeleteTarget(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete team member.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          TEAM
        </h1>
        <AdminButton onClick={openCreateModal}>
          <Plus size={14} /> ADD MEMBER
        </AdminButton>
      </div>

      {loading ? (
        <LoadingState label="Loading team members…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : members.length === 0 ? (
        <EmptyState label="No team members found." action={<AdminButton onClick={openCreateModal}>ADD MEMBER</AdminButton>} />
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTh>IMAGE</AdminTh>
              <AdminTh>NAME</AdminTh>
              <AdminTh>POST</AdminTh>
              <AdminTh>STATUS</AdminTh>
              <AdminTh>ORDER</AdminTh>
              <AdminTh>ACTIONS</AdminTh>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <AdminTd>
                  <img
                    src={member.image ? getImageUrl(member.image) : '/dinobots-team-bg.jpeg'}
                    alt={member.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </AdminTd>
                <AdminTd>{member.name}</AdminTd>
                <AdminTd>{member.post}</AdminTd>
                <AdminTd>
                  <StatusBadge active={member.isActive} />
                </AdminTd>
                <AdminTd>{member.order}</AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      aria-label={`Edit ${member.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.text }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(member)}
                      aria-label={member.isActive ? `Deactivate ${member.name}` : `Activate ${member.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: member.isActive ? admin.success : admin.textMuted }}
                    >
                      <Power size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(member)}
                      aria-label={`Delete ${member.name}`}
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

      <AdminModal open={modalOpen} title={editingId ? 'EDIT MEMBER' : 'ADD MEMBER'} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <AdminInput
            label="Name"
            htmlFor="member-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
          />
          <AdminInput
            label="Post"
            htmlFor="member-post"
            value={form.post}
            onChange={(e) => setForm((p) => ({ ...p, post: e.target.value }))}
            error={formErrors.post}
          />
          <AdminTextarea
            label="Description"
            htmlFor="member-description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
              Image
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
          <AdminInput
            label="Order"
            htmlFor="member-order"
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          />
          <AdminCheckbox
            label="Active"
            htmlFor="member-active"
            checked={form.isActive ?? true}
            onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
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
        title="DELETE TEAM MEMBER?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
