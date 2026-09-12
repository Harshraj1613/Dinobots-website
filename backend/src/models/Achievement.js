const mongoose = require('mongoose')

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

achievementSchema.index({ order: 1 })

module.exports = mongoose.model('Achievement', achievementSchema)
