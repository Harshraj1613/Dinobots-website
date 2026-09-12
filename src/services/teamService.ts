import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './apiClient'

export interface PublicTeamMember {
  id: string
  name: string
  post: string
  description: string
  image: string
  order: number
}

export interface AdminTeamMember extends PublicTeamMember {
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamMemberInput {
  name: string
  post: string
  description?: string
  image?: string
  order?: number
  isActive?: boolean
}

// Returns null when the request itself failed (network/server down) so
// callers can keep showing their existing fallback content; returns an
// array (possibly empty) when the backend genuinely answered.
async function getPublicTeam(): Promise<PublicTeamMember[] | null> {
  const result = await apiGet<{ team: PublicTeamMember[] }>('/api/team')
  return result.success ? result.team ?? [] : null
}

async function listTeam() {
  return apiGet<{ team: AdminTeamMember[] }>('/api/admin/team')
}

async function getTeamMember(id: string) {
  return apiGet<{ member: AdminTeamMember }>(`/api/admin/team/${id}`)
}

async function createTeamMember(input: TeamMemberInput) {
  return apiPost<{ member: AdminTeamMember }>('/api/admin/team', input)
}

async function updateTeamMember(id: string, input: Partial<TeamMemberInput>) {
  return apiPut<{ member: AdminTeamMember }>(`/api/admin/team/${id}`, input)
}

async function patchTeamStatus(id: string, isActive: boolean) {
  return apiPatch<{ member: AdminTeamMember }>(`/api/admin/team/${id}/status`, { isActive })
}

async function deleteTeamMember(id: string) {
  return apiDelete(`/api/admin/team/${id}`)
}

export const teamService = {
  getPublicTeam,
  listTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  patchTeamStatus,
  deleteTeamMember,
}
