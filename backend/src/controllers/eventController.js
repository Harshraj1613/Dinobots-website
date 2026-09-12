const Event = require('../models/Event')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, toBoolean } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }

function toPublicEvent(doc) {
  return {
    id: doc._id,
    name: doc.name,
    shortDescription: doc.shortDescription,
    fullDescription: doc.fullDescription,
    eventDate: doc.eventDate,
    eventTime: doc.eventTime,
    location: doc.location,
    registrationOpen: doc.registrationOpen,
    deadline: doc.deadline,
    image: doc.image,
  }
}

function toAdminEvent(doc) {
  return {
    id: doc._id,
    name: doc.name,
    shortDescription: doc.shortDescription,
    fullDescription: doc.fullDescription,
    eventDate: doc.eventDate,
    eventTime: doc.eventTime,
    location: doc.location,
    registrationOpen: doc.registrationOpen,
    deadline: doc.deadline,
    image: doc.image,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

// GET /api/events — public, active/published events only, soonest first.
async function getPublicEvents(req, res) {
  try {
    const events = await Event.find({ isActive: true }).sort({ eventDate: 1 })
    return res.status(200).json({ success: true, events: events.map(toPublicEvent) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// GET /api/admin/events — protected, everyone (active + inactive).
async function listEvents(req, res) {
  try {
    const events = await Event.find().sort({ eventDate: 1 })
    return res.status(200).json({ success: true, events: events.map(toAdminEvent) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })
    return res.status(200).json({ success: true, event: toAdminEvent(event) })
  } catch {
    return res.status(404).json({ success: false, message: 'Event not found.' })
  }
}

function toDateOrUndefined(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function validateEventInput(body, { partial = false } = {}) {
  const errors = {}
  if (!partial || body.name !== undefined) {
    if (!isNonEmptyString(body.name)) errors.name = 'Event name is required.'
  }
  if (!partial || body.shortDescription !== undefined) {
    if (!isNonEmptyString(body.shortDescription)) errors.shortDescription = 'Short description is required.'
  }
  if (typeof body.shortDescription === 'string' && body.shortDescription.length > 300) {
    errors.shortDescription = 'Short description must be 300 characters or fewer.'
  }
  if (typeof body.fullDescription === 'string' && body.fullDescription.length > 5000) {
    errors.fullDescription = 'Full description must be 5000 characters or fewer.'
  }
  if (!partial || body.eventDate !== undefined) {
    if (!body.eventDate || Number.isNaN(new Date(body.eventDate).getTime())) {
      errors.eventDate = 'A valid event date is required.'
    }
  }
  if (body.deadline !== undefined && body.deadline !== null && body.deadline !== '') {
    if (Number.isNaN(new Date(body.deadline).getTime())) errors.deadline = 'Deadline must be a valid date.'
  }
  return errors
}

// POST /api/admin/events
async function createEvent(req, res) {
  try {
    const errors = validateEventInput(req.body || {})
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid event data.', errors })
    }

    const {
      name,
      shortDescription,
      fullDescription = '',
      eventDate,
      eventTime = '',
      location = '',
      registrationOpen,
      deadline,
      image = '',
      isActive,
    } = req.body

    const event = await Event.create({
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: typeof fullDescription === 'string' ? fullDescription.trim() : '',
      eventDate: new Date(eventDate),
      eventTime: typeof eventTime === 'string' ? eventTime.trim() : '',
      location: typeof location === 'string' ? location.trim() : '',
      registrationOpen: toBoolean(registrationOpen, true),
      deadline: toDateOrUndefined(deadline) ?? null,
      image: typeof image === 'string' ? image.trim() : '',
      isActive: toBoolean(isActive, true),
    })

    await recordActivity('event_created', `Added event "${event.name}"`, 'Event', event._id)

    return res.status(201).json({ success: true, event: toAdminEvent(event) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// PUT /api/admin/events/:id
async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })

    const errors = validateEventInput(req.body || {}, { partial: true })
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid event data.', errors })
    }

    const {
      name,
      shortDescription,
      fullDescription,
      eventDate,
      eventTime,
      location,
      registrationOpen,
      deadline,
      image,
      isActive,
    } = req.body || {}

    if (name !== undefined) event.name = String(name).trim()
    if (shortDescription !== undefined) event.shortDescription = String(shortDescription).trim()
    if (fullDescription !== undefined) event.fullDescription = String(fullDescription).trim()
    if (eventDate !== undefined) event.eventDate = new Date(eventDate)
    if (eventTime !== undefined) event.eventTime = String(eventTime).trim()
    if (location !== undefined) event.location = String(location).trim()
    if (registrationOpen !== undefined) event.registrationOpen = toBoolean(registrationOpen, event.registrationOpen)
    if (deadline !== undefined) event.deadline = toDateOrUndefined(deadline) ?? null
    if (image !== undefined) event.image = String(image).trim()
    if (isActive !== undefined) event.isActive = toBoolean(isActive, event.isActive)

    await event.save()
    await recordActivity('event_updated', `Updated event "${event.name}"`, 'Event', event._id)

    return res.status(200).json({ success: true, event: toAdminEvent(event) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// DELETE /api/admin/events/:id
async function deleteEvent(req, res) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' })

    await recordActivity('event_deleted', `Deleted event "${event.name}"`, 'Event', event._id)

    return res.status(200).json({ success: true, message: 'Event deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  getPublicEvents,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
}
