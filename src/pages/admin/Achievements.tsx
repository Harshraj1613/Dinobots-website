import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import { AdminInput, AdminTextarea, AdminCheckbox } from '../../components/admin/AdminInput'
import { AdminTableShell, AdminTh, AdminTd } from '../../components/admin/AdminTable'
import StatusBadge from '../../components/admin/StatusBadge'
import AdminModal from '../../components/admin/AdminModal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../../components/admin/LoadingState'
import { useToast } from '../../components/admin/ToastContext'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { achievementService, type AdminAchievement, type AchievementInput } from '../../services/achievementService'
import { mediaService } from '../../services/mediaService'
import { getImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM: AchievementInput = { title: '', description: '', image: '', order: 0, isActive: true }

export default function AdminAchievementsPage() {
  const location = useLocation()
  const toast = useToast()

  const [achievements, setAchievements] = useState<AdminAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AchievementInput>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminAchievement | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await achievementService.listAchievements()
    if (result.success && result.achievements) {
      setAchievements(result.achievements)
      setError('')
    } else {
      setError(result.message || 'Failed to load achievements.')
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
    setForm({ ...EMPTY_FORM, order: achievements.length + 1 })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const openEditModal = (achievement: AdminAchievement) => {
    setEditingId(achievement.id)
    setForm({
      title: achievement.title,
      description: achievement.description,
      image: achievement.image,
      order: achievement.order,
      isActive: achievement.isActive,
    })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const handleImageChange = async (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    const result = await mediaService.uploadImage('achievements', file)
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
    if (!form.image.trim()) errors.image = 'Image is required.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    const result = editingId
      ? await achievementService.updateAchievement(editingId, form)
      : await achievementService.createAchievement(form)
    setSaving(false)

    if (result.success) {
      toast.showSuccess(editingId ? 'Achievement updated successfully.' : 'Achievement created successfully.')
      setModalOpen(false)
      load()
    } else {
      toast.showError(result.message || 'Failed to save achievement.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await achievementService.deleteAchievement(deleteTarget.id)
    if (result.success) {
      toast.showSuccess('Achievement deleted.')
      setDeleteTarget(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete achievement.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          ACHIEVEMENTS
        </h1>
        <AdminButton onClick={openCreateModal}>
          <Plus size={14} /> ADD ACHIEVEMENT
        </AdminButton>
      </div>

      {loading ? (
        <LoadingState label="Loading achievements…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : achievements.length === 0 ? (
        <EmptyState label="No achievements found." action={<AdminButton onClick={openCreateModal}>ADD ACHIEVEMENT</AdminButton>} />
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTh>IMAGE</AdminTh>
              <AdminTh>TITLE</AdminTh>
              <AdminTh>STATUS</AdminTh>
              <AdminTh>ORDER</AdminTh>
              <AdminTh>ACTIONS</AdminTh>
            </tr>
          </thead>
          <tbody>
            {achievements.map((achievement) => (
              <tr key={achievement.id}>
                <AdminTd>
                  <img src={getImageUrl(achievement.image)} alt={achievement.title || 'Achievement'} className="h-10 w-14 rounded-md object-cover" />
                </AdminTd>
                <AdminTd>{achievement.title || '—'}</AdminTd>
                <AdminTd>
                  <StatusBadge active={achievement.isActive} />
                </AdminTd>
                <AdminTd>{achievement.order}</AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(achievement)}
                      aria-label="Edit achievement"
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.text }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(achievement)}
                      aria-label="Delete achievement"
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

      <AdminModal open={modalOpen} title={editingId ? 'EDIT ACHIEVEMENT' : 'ADD ACHIEVEMENT'} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <AdminInput
            label="Title"
            htmlFor="achievement-title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <AdminTextarea
            label="Description"
            htmlFor="achievement-description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
              Image
            </label>
            <div className="flex items-center gap-3">
              {(localPreview || form.image) && (
                <img src={localPreview || getImageUrl(form.image)} alt="Preview" className="h-12 w-16 rounded-md object-cover" />
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
            {formErrors.image && (
              <span className="text-[11px]" style={{ color: admin.danger }}>
                {formErrors.image}
              </span>
            )}
          </div>
          <AdminInput
            label="Order"
            htmlFor="achievement-order"
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          />
          <AdminCheckbox
            label="Active"
            htmlFor="achievement-active"
            checked={form.isActive ?? true}
            onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
          <div className="mt-1 flex justify-end gap-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING…' : 'SAVE ACHIEVEMENT'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="DELETE ACHIEVEMENT?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
