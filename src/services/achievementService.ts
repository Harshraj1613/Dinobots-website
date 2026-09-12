import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'

export interface PublicAchievement {
  id: string
  title: string
  description: string
  image: string
  order: number
}

export interface AdminAchievement extends PublicAchievement {
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AchievementInput {
  title?: string
  description?: string
  image: string
  order?: number
  isActive?: boolean
}

// Returns null when the request itself failed (network/server down) so
// callers can keep showing their existing fallback content; returns an
// array (possibly empty) when the backend genuinely answered.
async function getPublicAchievements(): Promise<PublicAchievement[] | null> {
  const result = await apiGet<{ achievements: PublicAchievement[] }>('/api/achievements')
  return result.success ? result.achievements ?? [] : null
}

async function listAchievements() {
  return apiGet<{ achievements: AdminAchievement[] }>('/api/admin/achievements')
}

async function getAchievement(id: string) {
  return apiGet<{ achievement: AdminAchievement }>(`/api/admin/achievements/${id}`)
}

async function createAchievement(input: AchievementInput) {
  return apiPost<{ achievement: AdminAchievement }>('/api/admin/achievements', input)
}

async function updateAchievement(id: string, input: Partial<AchievementInput>) {
  return apiPut<{ achievement: AdminAchievement }>(`/api/admin/achievements/${id}`, input)
}

async function deleteAchievement(id: string) {
  return apiDelete(`/api/admin/achievements/${id}`)
}

export const achievementService = {
  getPublicAchievements,
  listAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
}
