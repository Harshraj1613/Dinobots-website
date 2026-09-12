const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  getPublicProjects,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController')

const router = express.Router()

// Public
router.get('/projects', getPublicProjects)

// Protected admin
router.get('/admin/projects', requireAuth, listProjects)
router.post('/admin/projects', requireAuth, createProject)
router.get('/admin/projects/:id', requireAuth, getProject)
router.put('/admin/projects/:id', requireAuth, updateProject)
router.delete('/admin/projects/:id', requireAuth, deleteProject)

module.exports = router
