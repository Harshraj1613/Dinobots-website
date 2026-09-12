const fs = require('fs')
const path = require('path')
const { ALLOWED_CATEGORIES, UPLOADS_ROOT } = require('../middleware/upload')

// Filenames are always generated server-side (see middleware/upload.js), so
// this pattern only ever needs to match what we ourselves produced — it
// doubles as a defense-in-depth check against path traversal on delete.
const SAFE_FILENAME = /^[0-9]+-[a-f0-9]{16}\.(jpg|png|webp)$/

// POST /api/admin/media/upload/:category — the actual file write already
// happened in the uploadSingleImage middleware by the time this runs.
async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file was provided.' })
  }
  const url = `/uploads/${req.params.category}/${req.file.filename}`
  return res.status(201).json({ success: true, url })
}

// GET /api/admin/media — lists every uploaded file across all categories,
// newest first. Files are the source of truth here (no separate DB model),
// matching the "keep it simple" media system asked for.
async function listMedia(req, res) {
  try {
    const files = []
    for (const category of ALLOWED_CATEGORIES) {
      const dir = path.join(UPLOADS_ROOT, category)
      const entries = fs.existsSync(dir) ? fs.readdirSync(dir) : []
      for (const filename of entries) {
        const stat = fs.statSync(path.join(dir, filename))
        if (!stat.isFile()) continue
        files.push({
          category,
          filename,
          url: `/uploads/${category}/${filename}`,
          size: stat.size,
          uploadedAt: stat.birthtime,
        })
      }
    }
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    return res.status(200).json({ success: true, files })
  } catch {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

// DELETE /api/admin/media/:category/:filename
async function deleteMedia(req, res) {
  try {
    const { category, filename } = req.params
    if (!ALLOWED_CATEGORIES.includes(category) || !SAFE_FILENAME.test(filename)) {
      return res.status(400).json({ success: false, message: 'Invalid media reference.' })
    }

    const filePath = path.join(UPLOADS_ROOT, category, filename)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found.' })
    }

    fs.unlinkSync(filePath)
    return res.status(200).json({ success: true, message: 'File deleted.' })
  } catch {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
  }
}

module.exports = { uploadImage, listMedia, deleteMedia }
