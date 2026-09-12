const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  getPublicAchievements,
  listAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController')

const router = express.Router()

// Public
router.get('/achievements', getPublicAchievements)

// Protected admin
router.get('/admin/achievements', requireAuth, listAchievements)
router.post('/admin/achievements', requireAuth, createAchievement)
router.get('/admin/achievements/:id', requireAuth, getAchievement)
router.put('/admin/achievements/:id', requireAuth, updateAchievement)
router.delete('/admin/achievements/:id', requireAuth, deleteAchievement)

module.exports = router
