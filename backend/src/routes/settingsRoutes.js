const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { getPublicSettings, getAdminSettings, updateSettings } = require('../controllers/settingsController')

const router = express.Router()

// Public
router.get('/site-settings', getPublicSettings)

// Protected admin
router.get('/admin/settings', requireAuth, getAdminSettings)
router.put('/admin/settings', requireAuth, updateSettings)

module.exports = router
