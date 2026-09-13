const fs = require('fs')
const path = require('path')
const { ALLOWED_CATEGORIES, UPLOADS_ROOT } = require('../middleware/upload')
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary')

// Filenames are always generated server-side (see middleware/upload.js), so
// this pattern only ever needs to match what we ourselves produced — it
// doubles as a defense-in-depth check against path traversal on delete.
const SAFE_FILENAME = /^[0-9]+-[a-f0-9]{16}\.(jpg|png|webp)$/

// POST /api/admin/media/upload/:category — the file arrives in memory only
// (see middleware/upload.js's memoryStorage) and is streamed straight to
// Cloudinary here; it is never written to this server's own disk, so it
// survives Render restarts/redeploys/spin-downs instead of vanishing with
// the container's ephemeral filesystem along with everything under
// UPLOADS_ROOT. `publicId` is additive (existing callers that only read
// `url` are unaffected) and lets utils/cloudinaryImage.js delete this exact
// asset later without needing a second field on whatever model stores it.
async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file was provided.' })
  }

  if (!isCloudinaryConfigured) {
    return res.status(500).json({
      success: false,
      message:
        'Media storage is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    })
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `dinobots/${req.params.category}`, resource_type: 'image' },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult)),
      )
      stream.end(req.file.buffer)
    })

    return res.status(201).json({ success: true, url: result.secure_url, publicId: result.public_id })
  } catch {
    return res.status(500).json({ success: false, message: 'Image upload failed.' })
  }
}

// GET /api/admin/media — lists local-disk files left over from before this
// switch to Cloudinary, newest first. Deliberately UNCHANGED: it still only
// scans UPLOADS_ROOT, so it keeps working exactly as before for whatever
// pre-existing `/uploads/...` files still happen to be on this container's
// disk — it just no longer reflects new uploads, since those are never
// written here anymore (they live in Cloudinary now; see uploadImage).
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
