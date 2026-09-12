const Project = require('../models/Project')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, toBoolean, toNumberOr } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }

function toPublicProject(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    image: doc.image,
    order: doc.order,
  }
}

function toAdminProject(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    image: doc.image,
    order: doc.order,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

async function getPublicProjects(req, res) {
  try {
    const projects = await Project.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, projects: projects.map(toPublicProject) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function listProjects(req, res) {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, projects: projects.map(toAdminProject) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getProject(req, res) {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' })
    return res.status(200).json({ success: true, project: toAdminProject(project) })
  } catch {
    return res.status(404).json({ success: false, message: 'Project not found.' })
  }
}

function validateProjectInput(body, { partial = false } = {}) {
  const errors = {}
  if (!partial || body.title !== undefined) {
    if (!isNonEmptyString(body.title)) errors.title = 'Title is required.'
  }
  if (!partial || body.description !== undefined) {
    if (!isNonEmptyString(body.description)) errors.description = 'Description is required.'
  }
  if (typeof body.description === 'string' && body.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }
  return errors
}

async function createProject(req, res) {
  try {
    const errors = validateProjectInput(req.body || {})
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid project data.', errors })
    }

    const { title, description, image = '', order, isActive } = req.body

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      image: typeof image === 'string' ? image.trim() : '',
      order: toNumberOr(order, 0),
      isActive: toBoolean(isActive, true),
    })

    await recordActivity('project_created', `Added project "${project.title}"`, 'Project', project._id)

    return res.status(201).json({ success: true, project: toAdminProject(project) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' })

    const errors = validateProjectInput(req.body || {}, { partial: true })
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid project data.', errors })
    }

    const { title, description, image, order, isActive } = req.body || {}
    if (title !== undefined) project.title = String(title).trim()
    if (description !== undefined) project.description = String(description).trim()
    if (image !== undefined) project.image = String(image).trim()
    if (order !== undefined) project.order = toNumberOr(order, project.order)
    if (isActive !== undefined) project.isActive = toBoolean(isActive, project.isActive)

    await project.save()
    await recordActivity('project_updated', `Updated project "${project.title}"`, 'Project', project._id)

    return res.status(200).json({ success: true, project: toAdminProject(project) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' })

    await recordActivity('project_deleted', `Deleted project "${project.title}"`, 'Project', project._id)

    return res.status(200).json({ success: true, message: 'Project deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  getPublicProjects,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
}
