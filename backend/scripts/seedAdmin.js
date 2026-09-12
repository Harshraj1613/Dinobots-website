require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../src/config/db')
const Admin = require('../src/models/Admin')
const { hashPassword } = require('../src/utils/auth')

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env before seeding.')
    process.exit(1)
  }

  await connectDB()

  const normalizedEmail = email.toLowerCase().trim()
  const existing = await Admin.findOne({ email: normalizedEmail })

  if (existing) {
    console.log('Admin already exists')
  } else {
    const passwordHash = await hashPassword(password)
    await Admin.create({ email: normalizedEmail, passwordHash })
    console.log('Admin created successfully')
  }

  await mongoose.disconnect()
  process.exit(0)
}

seedAdmin().catch(() => {
  console.error('Failed to seed admin.')
  process.exit(1)
})
