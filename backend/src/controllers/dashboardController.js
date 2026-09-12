const TeamMember = require('../models/TeamMember')
const Project = require('../models/Project')
const Achievement = require('../models/Achievement')
const JoinRequest = require('../models/JoinRequest')
const Event = require('../models/Event')
const EventJoinRequest = require('../models/EventJoinRequest')

async function getStats(req, res) {
  try {
    const [members, projects, achievements, pendingJoinRequests, events, pendingEventJoinRequests] = await Promise.all([
      TeamMember.countDocuments({ isActive: true }),
      Project.countDocuments({ isActive: true }),
      Achievement.countDocuments({ isActive: true }),
      JoinRequest.countDocuments({ status: 'pending' }),
      Event.countDocuments({ isActive: true }),
      EventJoinRequest.countDocuments({ status: 'pending' }),
    ])

    return res.status(200).json({
      success: true,
      stats: { members, projects, achievements, pendingJoinRequests, events, pendingEventJoinRequests },
    })
  } catch {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

module.exports = { getStats }
