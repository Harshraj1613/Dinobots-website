import { apiGet } from './apiClient'

export interface DashboardStats {
  members: number
  projects: number
  achievements: number
  pendingJoinRequests: number
  events: number
  pendingEventJoinRequests: number
}

async function getStats() {
  return apiGet<{ stats: DashboardStats }>('/api/admin/dashboard/stats')
}

export const dashboardService = { getStats }
