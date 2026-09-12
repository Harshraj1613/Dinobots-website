import { apiGet } from './apiClient'

export interface ActivityEntry {
  id: string
  type: string
  message: string
  entityType: string
  entityId: string
  createdAt: string
}

async function getRecent() {
  return apiGet<{ activities: ActivityEntry[] }>('/api/admin/activity')
}

export const activityService = { getRecent }
