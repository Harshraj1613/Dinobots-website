const Activity = require('../models/Activity')

async function getRecent(req, res) {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20)
    return res.status(200).json({
      success: true,
      activities: activities.map((a) => ({
        id: a._id,
        type: a.type,
        message: a.message,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt,
      })),
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

module.exports = { getRecent }
