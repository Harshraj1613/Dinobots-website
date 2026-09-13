const TeamMember = require('../models/TeamMember')
const { recordActivity } = require('../utils/activity')
const { isNonEmptyString, toBoolean, toNumberOr } = require('../utils/validation')
const { deleteCloudinaryImageIfApplicable } = require('../utils/cloudinaryImage')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }

function toPublicMember(doc) {
  return {
    id: doc._id,
    name: doc.name,
    post: doc.post,
    description: doc.description,
    image: doc.image,
    order: doc.order,
  }
}

function toAdminMember(doc) {
  return {
    id: doc._id,
    name: doc.name,
    post: doc.post,
    description: doc.description,
    image: doc.image,
    order: doc.order,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

// GET /api/team — public, active members only, ordered.
async function getPublicTeam(req, res) {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, team: members.map(toPublicMember) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// GET /api/admin/team — protected, everyone (active + inactive).
async function listTeam(req, res) {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ success: true, team: members.map(toAdminMember) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getTeamMember(req, res) {
  try {
    const member = await TeamMember.findById(req.params.id)
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' })
    return res.status(200).json({ success: true, member: toAdminMember(member) })
  } catch {
    return res.status(404).json({ success: false, message: 'Team member not found.' })
  }
}

function validateTeamInput(body, { partial = false } = {}) {
  const errors = {}
  if (!partial || body.name !== undefined) {
    if (!isNonEmptyString(body.name)) errors.name = 'Name is required.'
  }
  if (!partial || body.post !== undefined) {
    if (!isNonEmptyString(body.post)) errors.post = 'Post is required.'
  }
  if (body.description !== undefined && typeof body.description === 'string' && body.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer.'
  }
  return errors
}

// POST /api/admin/team
async function createTeamMember(req, res) {
  try {
    const errors = validateTeamInput(req.body || {})
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid team member data.', errors })
    }

    const { name, post, description = '', image = '', order, isActive } = req.body

    const member = await TeamMember.create({
      name: name.trim(),
      post: post.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      image: typeof image === 'string' ? image.trim() : '',
      order: toNumberOr(order, 0),
      isActive: toBoolean(isActive, true),
    })

    await recordActivity('team_member_created', `Added team member "${member.name}"`, 'TeamMember', member._id)

    return res.status(201).json({ success: true, member: toAdminMember(member) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// PUT /api/admin/team/:id
async function updateTeamMember(req, res) {
  try {
    const member = await TeamMember.findById(req.params.id)
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' })

    const errors = validateTeamInput(req.body || {}, { partial: true })
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid team member data.', errors })
    }

    const previousImage = member.image
    const { name, post, description, image, order, isActive } = req.body || {}
    if (name !== undefined) member.name = String(name).trim()
    if (post !== undefined) member.post = String(post).trim()
    if (description !== undefined) member.description = String(description).trim()
    if (image !== undefined) member.image = String(image).trim()
    if (order !== undefined) member.order = toNumberOr(order, member.order)
    if (isActive !== undefined) member.isActive = toBoolean(isActive, member.isActive)

    await member.save()

    // Best-effort cleanup of the OLD Cloudinary asset once the new image is
    // safely saved — never blocks/fails this request (see cloudinaryImage.js).
    // No-ops entirely for `/uploads/...` paths or an unchanged image.
    if (image !== undefined && member.image !== previousImage) {
      await deleteCloudinaryImageIfApplicable(previousImage)
    }

    await recordActivity('team_member_updated', `Updated team member "${member.name}"`, 'TeamMember', member._id)

    return res.status(200).json({ success: true, member: toAdminMember(member) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// PATCH /api/admin/team/:id/status
async function patchTeamStatus(req, res) {
  try {
    const member = await TeamMember.findById(req.params.id)
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' })

    if (typeof req.body?.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' })
    }

    member.isActive = req.body.isActive
    await member.save()
    await recordActivity(
      'team_member_updated',
      `${member.isActive ? 'Activated' : 'Deactivated'} team member "${member.name}"`,
      'TeamMember',
      member._id
    )

    return res.status(200).json({ success: true, member: toAdminMember(member) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// DELETE /api/admin/team/:id
async function deleteTeamMember(req, res) {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' })

    await deleteCloudinaryImageIfApplicable(member.image)

    await recordActivity('team_member_deleted', `Deleted team member "${member.name}"`, 'TeamMember', member._id)

    return res.status(200).json({ success: true, message: 'Team member deleted.' })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = {
  getPublicTeam,
  listTeam,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  patchTeamStatus,
  deleteTeamMember,
}
