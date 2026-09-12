const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

// The only categories a client may ever write into — req.params.category is
// untrusted input, so it is checked against this fixed list before it ever
// touches the filesystem. This is what stops an arbitrary filesystem path
// from being reachable via the upload route.
const ALLOWED_CATEGORIES = ['team', 'projects', 'achievements', 'events']

const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads')

// Uploads directories are fixed and created once at startup — never derived
// from client input.
for (const category of ALLOWED_CATEGORIES) {
  fs.mkdirSync(path.join(UPLOADS_ROOT, category), { recursive: true })
}

function validateCategory(req, res, next) {
  const { category } = req.params
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid media category.' })
  }
  next()
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // req.params.category is already validated by validateCategory (which
    // always runs first on every route using this storage), so it is safe
    // to use directly here.
    cb(null, path.join(UPLOADS_ROOT, req.params.category))
  },
  filename(req, file, cb) {
    // Never trust the client-supplied filename — generate a fresh random
    // one, extension taken only from the verified mimetype.
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype]
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
    cb(null, unique)
  },
})

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
    const error = new Error('UNSUPPORTED_FILE_TYPE')
    error.code = 'UNSUPPORTED_FILE_TYPE'
    return cb(error)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
})

// Wraps multer's single-file middleware so every failure mode (bad type,
// oversized file, anything else) resolves to the same consistent JSON error
// shape instead of leaking multer's own error object to the client.
function uploadSingleImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next()

    if (err.code === 'UNSUPPORTED_FILE_TYPE') {
      return res.status(400).json({ success: false, message: 'Only JPG, PNG, and WEBP images are allowed.' })
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Image must be 5MB or smaller.' })
    }
    return res.status(400).json({ success: false, message: 'Image upload failed.' })
  })
}

module.exports = {
  ALLOWED_CATEGORIES,
  UPLOADS_ROOT,
  validateCategory,
  uploadSingleImage,
}
