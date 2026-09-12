const EventJoinRequest = require('../models/EventJoinRequest')
const Event = require('../models/Event')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, isValidEmail } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }
const STATUSES = EventJoinRequest.STATUSES

function toAdminRequest(doc) {
  return {
    id: doc._id,
    eventId: doc.eventId,
    eventName: doc.eventName,
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    year: doc.year,
    branch: doc.branch,
    college: doc.college,
    areaOfInterest: doc.areaOfInterest,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

// POST /api/event-join-requests — public, no auth required.
async function createEventJoinRequest(req, res) {
  try {
    const { eventId, fullName, email, phone, year, branch, college, areaOfInterest, message } = req.body || {}
    const errors = {}

    if (!isNonEmptyString(eventId)) errors.eventId = 'Event is required.'
    if (!isNonEmptyString(fullName)) errors.fullName = 'Full name is required.'
    if (!isNonEmptyString(email) || !isValidEmail(email)) errors.email = 'A valid email is required.'
    if (!isNonEmptyString(phone)) errors.phone = 'Phone number is required.'
    if (!isNonEmptyString(year)) errors.year = 'Year is required.'
    if (!isNonEmptyString(branch)) errors.branch = 'Branch is required.'
    if (!isNonEmptyString(college)) errors.college = 'College / institute is required.'
    if (!isNonEmptyString(areaOfInterest)) errors.areaOfInterest = 'Area of interest is required.'
    if (!isNonEmptyString(message)) errors.message = 'Message is required.'

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Please fill in every field correctly.', errors })
    }

    const event = await Event.findById(eventId).catch(() => null)
    if (!event) {
      return res.status(400).json({ success: false, message: 'Selected event could not be found.' })
    }

    const joinRequest = await EventJoinRequest.create({
      eventId: event._id,
      eventName: event.name,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      year: year.trim(),
      branch: branch.trim(),
      college: college.trim(),
      areaOfInterest: areaOfInterest.trim(),
      message: message.trim(),
    })

    return res.status(201).json({ success: true, message: 'Event join request received.', id: joinRequest._id })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// GET /api/admin/event-join-requests — protected, optional ?status= filter.
async function listEventJoinRequests(req, res) {
  try {
    const filter = {}
    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status
    }
    const requests = await EventJoinRequest.find(filter).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, requests: requests.map(toAdminRequest) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getEventJoinRequest(req, res) {
  try {
    const joinRequest = await EventJoinRequest.findById(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Event join request not found.' })
    return res.status(200).json({ success: true, request: toAdminRequest(joinRequest) })
  } catch {
    return res.status(404).json({ success: false, message: 'Event join request not found.' })
  }
}

// PATCH /api/admin/event-join-requests/:id/status
async function updateEventJoinRequestStatus(req, res) {
  try {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${STATUSES.join(', ')}.` })
    }

    const joinRequest = await EventJoinRequest.findById(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Event join request not found.' })

    joinRequest.status = status
    await joinRequest.save()

    await recordActivity(
      'event_join_request_status_changed',
      `Marked event join request from "${joinRequest.fullName}" as ${status}`,
      'EventJoinRequest',
      joinRequest._id
    )

    return res.status(200).json({ success: true, request: toAdminRequest(joinRequest) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function deleteEventJoinRequest(req, res) {
  try {
    const joinRequest = await EventJoinRequest.findByIdAndDelete(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Event join request not found.' })
    return res.status(200).json({ success: true, message: 'Event join request deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  createEventJoinRequest,
  listEventJoinRequests,
  getEventJoinRequest,
  updateEventJoinRequestStatus,
  deleteEventJoinRequest,
}
