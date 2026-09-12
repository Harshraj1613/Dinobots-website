const mongoose = require('mongoose')

const STATUSES = ['pending', 'approved', 'rejected']

const eventJoinRequestSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    areaOfInterest: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: STATUSES, default: 'pending' },
  },
  { timestamps: true }
)

eventJoinRequestSchema.index({ status: 1 })
eventJoinRequestSchema.index({ createdAt: -1 })
eventJoinRequestSchema.index({ eventId: 1 })

eventJoinRequestSchema.statics.STATUSES = STATUSES

module.exports = mongoose.model('EventJoinRequest', eventJoinRequestSchema)
