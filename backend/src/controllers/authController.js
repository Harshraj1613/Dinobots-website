const Admin = require('../models/Admin')
const { comparePassword, generateToken, getAuthCookieOptions } = require('../utils/auth')

const COOKIE_NAME = process.env.COOKIE_NAME || 'dinobots_admin_token'
const GENERIC_INVALID_MESSAGE = 'Invalid email or password'

function toSafeAdmin(admin) {
  return {
    id: admin._id,
    email: admin.email,
    role: admin.role,
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {}

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ success: false, message: GENERIC_INVALID_MESSAGE })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })

    // Same generic response whether the email doesn't exist or the
    // password is wrong — never reveal which one it was.
    if (!admin) {
      return res.status(401).json({ success: false, message: GENERIC_INVALID_MESSAGE })
    }

    const isMatch = await comparePassword(password, admin.passwordHash)

    if (!isMatch) {
      return res.status(401).json({ success: false, message: GENERIC_INVALID_MESSAGE })
    }

    const token = generateToken({ id: admin._id, role: admin.role })

    // JWT lives ONLY in this http-only cookie — it is never included in
    // the JSON response body.
    res.cookie(COOKIE_NAME, token, getAuthCookieOptions())

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: toSafeAdmin(admin),
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

async function logout(req, res) {
  // `maxAge` must NOT be passed here — Express's cookie handling uses it to
  // compute a fresh future `Expires`, which would overwrite clearCookie's
  // own past-dated Expires and leave an (empty-valued, harmless, but not
  // actually cleared) cookie sitting in the browser for another JWT lifetime.
  const { maxAge, ...clearOptions } = getAuthCookieOptions()
  res.clearCookie(COOKIE_NAME, clearOptions)
  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

module.exports = { login, logout }
