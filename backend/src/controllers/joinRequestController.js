const JoinRequest = require('../models/JoinRequest')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, isValidEmail } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }
const STATUSES = JoinRequest.STATUSES

function toAdminRequest(doc) {
  return {
    id: doc._id,
    fullName: doc.fullName,
    email: doc.email,
    year: doc.year,
    branch: doc.branch,
    areaOfInterest: doc.areaOfInterest,
    reason: doc.reason,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

// POST /api/join-requests — public, no auth required.
async function createJoinRequest(req, res) {
  try {
    const { fullName, email, year, branch, areaOfInterest, reason } = req.body || {}
    const errors = {}

    if (!isNonEmptyString(fullName)) errors.fullName = 'Full name is required.'
    if (!isNonEmptyString(email) || !isValidEmail(email)) errors.email = 'A valid email is required.'
    if (!isNonEmptyString(year)) errors.year = 'Year is required.'
    if (!isNonEmptyString(branch)) errors.branch = 'Branch is required.'
    if (!isNonEmptyString(areaOfInterest)) errors.areaOfInterest = 'Area of interest is required.'
    if (!isNonEmptyString(reason)) errors.reason = 'Reason is required.'

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Please fill in every field correctly.', errors })
    }

    const joinRequest = await JoinRequest.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      year: year.trim(),
      branch: branch.trim(),
      areaOfInterest: areaOfInterest.trim(),
      reason: reason.trim(),
    })

    return res.status(201).json({ success: true, message: 'Application received.', id: joinRequest._id })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// GET /api/admin/join-requests — protected, optional ?status= filter.
async function listJoinRequests(req, res) {
  try {
    const filter = {}
    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status
    }
    const requests = await JoinRequest.find(filter).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, requests: requests.map(toAdminRequest) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getJoinRequest(req, res) {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Join request not found.' })
    return res.status(200).json({ success: true, request: toAdminRequest(joinRequest) })
  } catch {
    return res.status(404).json({ success: false, message: 'Join request not found.' })
  }
}

// PATCH /api/admin/join-requests/:id/status
async function updateJoinRequestStatus(req, res) {
  try {
    const { status } = req.body || {}
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${STATUSES.join(', ')}.` })
    }

    const joinRequest = await JoinRequest.findById(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Join request not found.' })

    joinRequest.status = status
    await joinRequest.save()

    await recordActivity(
      'join_request_status_changed',
      `Marked join request from "${joinRequest.fullName}" as ${status}`,
      'JoinRequest',
      joinRequest._id
    )

    return res.status(200).json({ success: true, request: toAdminRequest(joinRequest) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function deleteJoinRequest(req, res) {
  try {
    const joinRequest = await JoinRequest.findByIdAndDelete(req.params.id)
    if (!joinRequest) return res.status(404).json({ success: false, message: 'Join request not found.' })
    return res.status(200).json({ success: true, message: 'Join request deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  createJoinRequest,
  listJoinRequests,
  getJoinRequest,
  updateJoinRequestStatus,
  deleteJoinRequest,
}
