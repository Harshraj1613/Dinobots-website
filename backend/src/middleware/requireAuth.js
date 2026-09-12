const Admin = require('../models/Admin')
const { verifyToken } = require('../utils/auth')

const COOKIE_NAME = process.env.COOKIE_NAME || 'dinobots_admin_token'
const AUTH_REQUIRED = { success: false, message: 'Authentication required' }

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies ? req.cookies[COOKIE_NAME] : undefined

    if (!token) {
      return res.status(401).json(AUTH_REQUIRED)
    }

    const payload = verifyToken(token)
    const admin = await Admin.findById(payload.id)

    if (!admin) {
      return res.status(401).json(AUTH_REQUIRED)
    }

    req.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    }

    return next()
  } catch (error) {
    // Missing, malformed, expired, or tampered token all land here —
    // never expose the underlying jsonwebtoken error to the client.
    return res.status(401).json(AUTH_REQUIRED)
  }
}

module.exports = requireAuth
