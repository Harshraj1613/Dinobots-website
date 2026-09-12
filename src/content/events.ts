// Content for the Events section. Kept separate so this section owns its
// own copy — edit here without touching About/Projects. The events list
// below is only a fallback shown before the live API data arrives (or if
// the backend is ever unreachable) — see components/Events.tsx.

export interface EventEntry {
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

export const eventsContent = {
  heading: 'UPCOMING EVENTS',
  background: '/dinobots-event-bg.jpeg',
  events: [] as EventEntry[],
} as const
