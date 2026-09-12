const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/[^\s]+$/

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
}

// Empty string is treated as "not provided" and considered valid — settings
// URL fields are optional, this just guards against garbage when present.
function isValidUrlOrEmpty(value) {
  if (value === undefined || value === null || value === '') return true
  return typeof value === 'string' && URL_PATTERN.test(value.trim())
}

function toBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

// Coerces to a finite number, falling back when the input is missing or
// not a valid number — used for `order`, which admins may leave blank.
function toNumberOr(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidUrlOrEmpty,
  toBoolean,
  toNumberOr,
}
