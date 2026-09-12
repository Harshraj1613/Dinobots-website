const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  getPublicTeam,
  listTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  patchTeamStatus,
  deleteTeamMember,
} = require('../controllers/teamController')

const router = express.Router()

// Public
router.get('/team', getPublicTeam)

// Protected admin
router.get('/admin/team', requireAuth, listTeam)
router.post('/admin/team', requireAuth, createTeamMember)
router.get('/admin/team/:id', requireAuth, getTeamMember)
router.put('/admin/team/:id', requireAuth, updateTeamMember)
router.patch('/admin/team/:id/status', requireAuth, patchTeamStatus)
router.delete('/admin/team/:id', requireAuth, deleteTeamMember)

module.exports = router
