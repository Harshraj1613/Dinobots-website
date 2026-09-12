const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
    fullDescription: { type: String, default: '', trim: true, maxlength: 5000 },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    registrationOpen: { type: Boolean, default: true },
    deadline: { type: Date, default: null },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

eventSchema.index({ eventDate: 1 })
eventSchema.index({ isActive: 1 })

module.exports = mongoose.model('Event', eventSchema)
