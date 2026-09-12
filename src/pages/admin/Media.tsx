import { useEffect, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import AdminCard from '../../components/admin/AdminCard'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { LoadingState, EmptyState, ErrorState } from '../../components/admin/LoadingState'
import { useToast } from '../../components/admin/ToastContext'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { mediaService, type MediaCategory, type MediaFile } from '../../services/mediaService'
import { getImageUrl } from '../../utils/imageUrl'

const CATEGORIES: MediaCategory[] = ['team', 'projects', 'achievements', 'events']

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMediaPage() {
  const toast = useToast()
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadingCategory, setUploadingCategory] = useState<MediaCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null)

  const load = async () => {
    setLoading(true)
    const result = await mediaService.listMedia()
    if (result.success && result.files) {
      setFiles(result.files)
      setError('')
    } else {
      setError(result.message || 'Failed to load media.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (category: MediaCategory, file: File) => {
    setUploadingCategory(category)
    const result = await mediaService.uploadImage(category, file)
    setUploadingCategory(null)
    if (result.success) {
      toast.showSuccess('Image uploaded successfully.')
      load()
    } else {
      toast.showError(result.message || 'Upload failed.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await mediaService.deleteMedia(deleteTarget.category, deleteTarget.filename)
    if (result.success) {
      toast.showSuccess('File deleted.')
      setDeleteTarget(null)
      load()
    } else {
      toast.showError(result.message || 'Failed to delete file.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
        MEDIA
      </h1>

      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-black/[0.03]"
            style={{ borderColor: admin.border, color: admin.text, fontFamily: ADMIN_BODY_FONT }}
          >
            <Upload size={14} style={{ color: admin.accent }} />
            {uploadingCategory === category ? 'UPLOADING…' : `UPLOAD TO ${category.toUpperCase()}`}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploadingCategory !== null}
              onChange={(e) => e.target.files?.[0] && handleUpload(category, e.target.files[0])}
            />
          </label>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading media…" />
      ) : error ? (
        <ErrorState label={error} />
      ) : files.length === 0 ? (
        <EmptyState label="No uploaded media yet." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((file) => (
            <AdminCard key={file.url} padded={false} className="overflow-hidden">
              <img src={getImageUrl(file.url)} alt={file.filename} className="h-28 w-full object-cover" />
              <div className="flex flex-col gap-1 p-3">
                <span
                  className="truncate text-[10px] font-semibold uppercase tracking-[0.06em]"
                  style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
                >
                  {file.category}
                </span>
                <span className="truncate text-[11px]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>
                  {file.filename}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}>
                    {formatSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    aria-label={`Delete ${file.filename}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md border transition-colors hover:bg-black/5"
                    style={{ borderColor: admin.border, color: admin.danger }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="DELETE FILE?"
        description="This action cannot be undone. Content referencing this image may break."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
