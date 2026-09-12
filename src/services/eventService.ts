import { apiDelete, apiGet, apiPost, apiPut } from './apiClient'

export interface PublicEvent {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  eventDate: string
  eventTime: string
  location: string
  registrationOpen: boolean
  deadline: string | null
  image: string
}

export interface AdminEvent extends PublicEvent {
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EventInput {
  name: string
  shortDescription: string
  fullDescription?: string
  eventDate: string
  eventTime?: string
  location?: string
  registrationOpen?: boolean
  deadline?: string | null
  image?: string
  isActive?: boolean
}

// Returns null when the request itself failed (network/server down) so
// callers can keep showing their existing fallback content; returns an
// array (possibly empty) when the backend genuinely answered.
async function getPublicEvents(): Promise<PublicEvent[] | null> {
  const result = await apiGet<{ events: PublicEvent[] }>('/api/events')
  return result.success ? result.events ?? [] : null
}

async function listEvents() {
  return apiGet<{ events: AdminEvent[] }>('/api/admin/events')
}

async function getEvent(id: string) {
  return apiGet<{ event: AdminEvent }>(`/api/admin/events/${id}`)
}

async function createEvent(input: EventInput) {
  return apiPost<{ event: AdminEvent }>('/api/admin/events', input)
}

async function updateEvent(id: string, input: Partial<EventInput>) {
  return apiPut<{ event: AdminEvent }>(`/api/admin/events/${id}`, input)
}

async function deleteEvent(id: string) {
  return apiDelete(`/api/admin/events/${id}`)
}

export const eventService = {
  getPublicEvents,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
}
