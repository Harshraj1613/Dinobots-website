const mongoose = require('mongoose')

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    post: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

teamMemberSchema.index({ order: 1 })

module.exports = mongoose.model('TeamMember', teamMemberSchema)
