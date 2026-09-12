import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type EventJoinRequestStatus = 'pending' | 'approved' | 'rejected'

export interface EventJoinRequestInput {
  eventId: string
  fullName: string
  email: string
  phone: string
  year: string
  branch: string
  college: string
  areaOfInterest: string
  message: string
}

export interface AdminEventJoinRequest extends EventJoinRequestInput {
  id: string
  eventName: string
  status: EventJoinRequestStatus
  createdAt: string
  updatedAt: string
}

// Public — no auth required. Used by the Events section's Join Event modal.
async function submit(input: EventJoinRequestInput) {
  return apiPost<{ id: string }>('/api/event-join-requests', input)
}

async function listEventJoinRequests(status?: EventJoinRequestStatus) {
  const query = status ? `?status=${status}` : ''
  return apiGet<{ requests: AdminEventJoinRequest[] }>(`/api/admin/event-join-requests${query}`)
}

async function getEventJoinRequest(id: string) {
  return apiGet<{ request: AdminEventJoinRequest }>(`/api/admin/event-join-requests/${id}`)
}

async function updateStatus(id: string, status: EventJoinRequestStatus) {
  return apiPatch<{ request: AdminEventJoinRequest }>(`/api/admin/event-join-requests/${id}/status`, { status })
}

async function deleteEventJoinRequest(id: string) {
  return apiDelete(`/api/admin/event-join-requests/${id}`)
}

export const eventJoinRequestService = {
  submit,
  listEventJoinRequests,
  getEventJoinRequest,
  updateStatus,
  deleteEventJoinRequest,
}
