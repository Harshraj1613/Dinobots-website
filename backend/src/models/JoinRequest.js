const mongoose = require('mongoose')

const STATUSES = ['pending', 'reviewed', 'accepted', 'rejected']

const joinRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    year: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    areaOfInterest: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: STATUSES, default: 'pending' },
  },
  { timestamps: true }
)

joinRequestSchema.index({ status: 1 })
joinRequestSchema.index({ createdAt: -1 })

joinRequestSchema.statics.STATUSES = STATUSES

module.exports = mongoose.model('JoinRequest', joinRequestSchema)
