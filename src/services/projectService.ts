import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'

export interface PublicProject {
  id: string
  title: string
  description: string
  image: string
  order: number
}

export interface AdminProject extends PublicProject {
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  description: string
  image?: string
  order?: number
  isActive?: boolean
}

// Returns null when the request itself failed (network/server down) so
// callers can keep showing their existing fallback content; returns an
// array (possibly empty) when the backend genuinely answered.
async function getPublicProjects(): Promise<PublicProject[] | null> {
  const result = await apiGet<{ projects: PublicProject[] }>('/api/projects')
  return result.success ? result.projects ?? [] : null
}

async function listProjects() {
  return apiGet<{ projects: AdminProject[] }>('/api/admin/projects')
}

async function getProject(id: string) {
  return apiGet<{ project: AdminProject }>(`/api/admin/projects/${id}`)
}

async function createProject(input: ProjectInput) {
  return apiPost<{ project: AdminProject }>('/api/admin/projects', input)
}

async function updateProject(id: string, input: Partial<ProjectInput>) {
  return apiPut<{ project: AdminProject }>(`/api/admin/projects/${id}`, input)
}

async function deleteProject(id: string) {
  return apiDelete(`/api/admin/projects/${id}`)
}

export const projectService = {
  getPublicProjects,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
}
