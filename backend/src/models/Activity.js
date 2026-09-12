const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, default: '' },
    entityId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

activitySchema.index({ createdAt: -1 })

module.exports = mongoose.model('Activity', activitySchema)
