const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  getPublicEvents,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController')

const router = express.Router()

// Public
router.get('/events', getPublicEvents)

// Protected admin
router.get('/admin/events', requireAuth, listEvents)
router.post('/admin/events', requireAuth, createEvent)
router.get('/admin/events/:id', requireAuth, getEvent)
router.put('/admin/events/:id', requireAuth, updateEvent)
router.delete('/admin/events/:id', requireAuth, deleteEvent)

module.exports = router
