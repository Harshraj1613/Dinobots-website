const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  createJoinRequest,
  listJoinRequests,
  getJoinRequest,
  updateJoinRequestStatus,
  deleteJoinRequest,
} = require('../controllers/joinRequestController')

const router = express.Router()

// Public — no auth required to apply.
router.post('/join-requests', createJoinRequest)

// Protected admin
router.get('/admin/join-requests', requireAuth, listJoinRequests)
router.get('/admin/join-requests/:id', requireAuth, getJoinRequest)
router.patch('/admin/join-requests/:id/status', requireAuth, updateJoinRequestStatus)
router.delete('/admin/join-requests/:id', requireAuth, deleteJoinRequest)

module.exports = router
