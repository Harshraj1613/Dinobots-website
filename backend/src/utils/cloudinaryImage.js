const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary')

// Recognizes only URLs Cloudinary itself would have returned — an existing
// `/uploads/...` local-disk path (or anything else) simply isn't one, and is
// left completely alone by every function below.
function isCloudinaryUrl(url) {
  return typeof url === 'string' && /^https?:\/\/res\.cloudinary\.com\//i.test(url)
}

// Derives the public_id Cloudinary's own destroy() call needs directly from
// the secure_url we already stored — deliberately avoids adding a second
// "publicId" field to every model just to remember it, so existing
// documents that only ever had a plain `image` string stay fully
// compatible. Safe because we control exactly how these URLs are produced
// (see mediaController.js: no eager transformations, always `folder/name`).
function extractPublicId(url) {
  const uploadMarker = '/upload/'
  const markerIndex = url.indexOf(uploadMarker)
  if (markerIndex === -1) return null

  let rest = url.slice(markerIndex + uploadMarker.length)
  rest = rest.replace(/^v\d+\//, '') // drop the version segment, if present

  const lastDot = rest.lastIndexOf('.')
  return lastDot === -1 ? rest : rest.slice(0, lastDot)
}

// Best-effort only — deliberately never throws. Used when a record's image
// is replaced or the record itself is deleted; a stale/orphaned Cloudinary
// asset is a minor storage cost, while failing an admin's save or delete
// because cleanup didn't work would be a much worse outcome. No-ops
// entirely for `/uploads/...` paths, empty strings, or when Cloudinary
// isn't configured.
async function deleteCloudinaryImageIfApplicable(url) {
  if (!isCloudinaryConfigured || !isCloudinaryUrl(url)) return

  const publicId = extractPublicId(url)
  if (!publicId) return

  try {
    await cloudinary.uploader.destroy(publicId)
  } catch {
    // Swallowed deliberately — see comment above.
  }
}

module.exports = { isCloudinaryUrl, extractPublicId, deleteCloudinaryImageIfApplicable }
