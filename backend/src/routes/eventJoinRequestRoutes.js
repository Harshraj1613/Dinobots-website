const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  createEventJoinRequest,
  listEventJoinRequests,
  getEventJoinRequest,
  updateEventJoinRequestStatus,
  deleteEventJoinRequest,
} = require('../controllers/eventJoinRequestController')

const router = express.Router()

// Public — no auth required to join an event.
router.post('/event-join-requests', createEventJoinRequest)

// Protected admin
router.get('/admin/event-join-requests', requireAuth, listEventJoinRequests)
router.get('/admin/event-join-requests/:id', requireAuth, getEventJoinRequest)
router.patch('/admin/event-join-requests/:id/status', requireAuth, updateEventJoinRequestStatus)
router.delete('/admin/event-join-requests/:id', requireAuth, deleteEventJoinRequest)

module.exports = router
