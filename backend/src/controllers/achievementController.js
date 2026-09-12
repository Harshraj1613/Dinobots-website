const Achievement = require('../models/Achievement')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, toBoolean, toNumberOr } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }

function toPublicAchievement(doc) {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    image: doc.image,
    order: doc.order,
  }
}

function toAdminAchievement(doc) {
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

async function getPublicAchievements(req, res) {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, achievements: achievements.map(toPublicAchievement) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function listAchievements(req, res) {
  try {
    const achievements = await Achievement.find().sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, achievements: achievements.map(toAdminAchievement) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getAchievement(req, res) {
  try {
    const achievement = await Achievement.findById(req.params.id)
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' })
    return res.status(200).json({ success: true, achievement: toAdminAchievement(achievement) })
  } catch {
    return res.status(404).json({ success: false, message: 'Achievement not found.' })
  }
}

function validateAchievementInput(body, { partial = false } = {}) {
  const errors = {}
  if (!partial || body.image !== undefined) {
    if (!isNonEmptyString(body.image)) errors.image = 'Image is required.'
  }
  if (typeof body.description === 'string' && body.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }
  return errors
}

async function createAchievement(req, res) {
  try {
    const errors = validateAchievementInput(req.body || {})
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid achievement data.', errors })
    }

    const { title = '', description = '', image, order, isActive } = req.body

    const achievement = await Achievement.create({
      title: typeof title === 'string' ? title.trim() : '',
      description: typeof description === 'string' ? description.trim() : '',
      image: image.trim(),
      order: toNumberOr(order, 0),
      isActive: toBoolean(isActive, true),
    })

    await recordActivity(
      'achievement_created',
      `Added achievement${achievement.title ? ` "${achievement.title}"` : ''}`,
      'Achievement',
      achievement._id
    )

    return res.status(201).json({ success: true, achievement: toAdminAchievement(achievement) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function updateAchievement(req, res) {
  try {
    const achievement = await Achievement.findById(req.params.id)
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' })

    const errors = validateAchievementInput(req.body || {}, { partial: true })
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid achievement data.', errors })
    }

    const { title, description, image, order, isActive } = req.body || {}
    if (title !== undefined) achievement.title = String(title).trim()
    if (description !== undefined) achievement.description = String(description).trim()
    if (image !== undefined) achievement.image = String(image).trim()
    if (order !== undefined) achievement.order = toNumberOr(order, achievement.order)
    if (isActive !== undefined) achievement.isActive = toBoolean(isActive, achievement.isActive)

    await achievement.save()
    await recordActivity(
      'achievement_updated',
      `Updated achievement${achievement.title ? ` "${achievement.title}"` : ''}`,
      'Achievement',
      achievement._id
    )

    return res.status(200).json({ success: true, achievement: toAdminAchievement(achievement) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function deleteAchievement(req, res) {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id)
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' })

    await recordActivity(
      'achievement_deleted',
      `Deleted achievement${achievement.title ? ` "${achievement.title}"` : ''}`,
      'Achievement',
      achievement._id
    )

    return res.status(200).json({ success: true, message: 'Achievement deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  getPublicAchievements,
  listAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
}
