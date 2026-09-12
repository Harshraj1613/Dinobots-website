import { API_BASE_URL } from '../config/api'
import { apiDelete, apiGet } from './apiClient'

export type MediaCategory = 'team' | 'projects' | 'achievements' | 'events'

export interface MediaFile {
  category: MediaCategory
  filename: string
  url: string
  size: number
  uploadedAt: string
}

async function listMedia() {
  return apiGet<{ files: MediaFile[] }>('/api/admin/media')
}

// multipart/form-data upload — goes through apiClient's fetch wrapper too
// (FormData is detected there and the Content-Type header is left for the
// browser to set with the correct boundary).
async function uploadImage(category: MediaCategory, file: File) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_BASE_URL}/api/admin/media/upload/${category}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return (await response.json().catch(() => ({ success: false, message: 'Upload failed.' }))) as {
    success: boolean
    url?: string
    message?: string
  }
}

async function deleteMedia(category: MediaCategory, filename: string) {
  return apiDelete(`/api/admin/media/${category}/${filename}`)
}

export const mediaService = { listMedia, uploadImage, deleteMedia }
