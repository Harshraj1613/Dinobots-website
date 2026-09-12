const Activity = require('../models/Activity')

// Best-effort activity logging — a failure here must never break the
// actual mutation it's describing, so errors are swallowed (not thrown,
// not even logged with detail that could include user data).
async function recordActivity(type, message, entityType = '', entityId = '') {
  try {
    await Activity.create({ type, message, entityType, entityId: String(entityId || '') })
  } catch {
    // Non-critical — intentionally ignored.
  }
}

module.exports = { recordActivity }
