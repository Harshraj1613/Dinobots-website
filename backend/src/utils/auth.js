const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

// JWT payload carries only the minimum needed to identify the admin —
// never the password/hash, never logged anywhere.
function generateToken(payload) {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h'

  if (!secret) {
    throw new Error('JWT_SECRET is not set.')
  }

  return jwt.sign(payload, secret, { expiresIn })
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not set.')
  }

  return jwt.verify(token, secret)
}

// Converts a jsonwebtoken-style duration string ("1h", "7d", "30m", "45s")
// into milliseconds for the cookie's maxAge, so the cookie's own lifetime
// always tracks JWT_EXPIRES_IN instead of being hardcoded separately.
function parseDurationToMs(duration) {
  const DEFAULT_MS = 60 * 60 * 1000 // 1 hour fallback
  const UNIT_MS = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }

  const match = /^(\d+)\s*(s|m|h|d)$/.exec(String(duration).trim())
  if (!match) return DEFAULT_MS

  return Number(match[1]) * UNIT_MS[match[2]]
}

// Centralized cookie options so login/logout always agree on how the
// auth cookie is written and cleared.
function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseDurationToMs(process.env.JWT_EXPIRES_IN || '1h'),
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getAuthCookieOptions,
}
