const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { getStats } = require('../controllers/dashboardController')

const router = express.Router()

router.get('/stats', requireAuth, getStats)

module.exports = router
