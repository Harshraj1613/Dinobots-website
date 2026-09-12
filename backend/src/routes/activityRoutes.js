const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { getRecent } = require('../controllers/activityController')

const router = express.Router()

router.get('/', requireAuth, getRecent)

module.exports = router
