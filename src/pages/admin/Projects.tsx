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
import { projectService, type AdminProject, type ProjectInput } from '../../services/projectService'
import { mediaService } from '../../services/mediaService'
import { getImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM: ProjectInput = { title: '', description: '', image: '', order: 0, isActive: true }

export default function AdminProjectsPage() {
  const location = useLocation()
  const toast = useToast()

  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminProject | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await projectService.listProjects()
    if (result.success && result.projects) {
      setProjects(result.projects)
      setError('')
    } else {
      setError(result.message || 'Failed to load projects.')
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
    setForm({ ...EMPTY_FORM, order: projects.length + 1 })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const openEditModal = (project: AdminProject) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      description: project.description,
      image: project.image,
      order: project.order,
      isActive: project.isActive,
    })
    setFormErrors({})
    setLocalPreview(null)
    setModalOpen(true)
  }

  const handleImageChange = async (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    const result = await mediaService.uploadImage('projects', file)
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
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!form.description.trim()) errors.description = 'Description is required.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    const result = editingId
      ? await projectService.updateProject(editingId, form)
      : await projectService.createProject(form)
    setSaving(false)

    if (result.success) {
      toast.showSuccess(editingId ? 'Project updated successfully.' : 'Project created successfully.')
      setModalOpen(false)
      load()
    } else {
      toast.showError(result.message || 'Failed to save project.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await projectService.deleteProject(deleteTarget.id)
    if (result.success) {
      toast.showSuccess('Project deleted.')
      setDeleteTarget(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete project.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          PROJECTS
        </h1>
        <AdminButton onClick={openCreateModal}>
          <Plus size={14} /> ADD PROJECT
        </AdminButton>
      </div>

      {loading ? (
        <LoadingState label="Loading projects…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : projects.length === 0 ? (
        <EmptyState label="No projects found." action={<AdminButton onClick={openCreateModal}>ADD PROJECT</AdminButton>} />
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTh>IMAGE</AdminTh>
              <AdminTh>TITLE</AdminTh>
              <AdminTh>DESCRIPTION</AdminTh>
              <AdminTh>STATUS</AdminTh>
              <AdminTh>ORDER</AdminTh>
              <AdminTh>ACTIONS</AdminTh>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <AdminTd>
                  <img src={getImageUrl(project.image)} alt={project.title} className="h-10 w-14 rounded-md object-cover" />
                </AdminTd>
                <AdminTd>{project.title}</AdminTd>
                <AdminTd className="max-w-[280px] truncate">{project.description}</AdminTd>
                <AdminTd>
                  <StatusBadge active={project.isActive} />
                </AdminTd>
                <AdminTd>{project.order}</AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(project)}
                      aria-label={`Edit ${project.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                      style={{ borderColor: admin.border, color: admin.text }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(project)}
                      aria-label={`Delete ${project.title}`}
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

      <AdminModal open={modalOpen} title={editingId ? 'EDIT PROJECT' : 'ADD PROJECT'} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4">
          <AdminInput
            label="Title"
            htmlFor="project-title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={formErrors.title}
          />
          <AdminTextarea
            label="Description"
            htmlFor="project-description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={formErrors.description}
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
          </div>
          <AdminInput
            label="Order"
            htmlFor="project-order"
            type="number"
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          />
          <AdminCheckbox
            label="Active"
            htmlFor="project-active"
            checked={form.isActive ?? true}
            onChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
          <div className="mt-1 flex justify-end gap-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING…' : 'SAVE PROJECT'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="DELETE PROJECT?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
