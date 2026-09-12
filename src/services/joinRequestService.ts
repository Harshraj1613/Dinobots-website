import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type JoinRequestStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export interface JoinRequestInput {
  fullName: string
  email: string
  year: string
  branch: string
  areaOfInterest: string
  reason: string
}

export interface AdminJoinRequest extends JoinRequestInput {
  id: string
  status: JoinRequestStatus
  createdAt: string
  updatedAt: string
}

// Public — no auth required. Used by the /join-us Apply form.
async function submit(input: JoinRequestInput) {
  return apiPost<{ id: string }>('/api/join-requests', input)
}

async function listJoinRequests(status?: JoinRequestStatus) {
  const query = status ? `?status=${status}` : ''
  return apiGet<{ requests: AdminJoinRequest[] }>(`/api/admin/join-requests${query}`)
}

async function getJoinRequest(id: string) {
  return apiGet<{ request: AdminJoinRequest }>(`/api/admin/join-requests/${id}`)
}

async function updateStatus(id: string, status: JoinRequestStatus) {
  return apiPatch<{ request: AdminJoinRequest }>(`/api/admin/join-requests/${id}/status`, { status })
}

async function deleteJoinRequest(id: string) {
  return apiDelete(`/api/admin/join-requests/${id}`)
}

export const joinRequestService = { submit, listJoinRequests, getJoinRequest, updateStatus, deleteJoinRequest }
