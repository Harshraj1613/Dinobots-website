const cloudinary = require('cloudinary').v2

// Reads ONLY these three — never any other env var, never a hardcoded
// fallback. Credentials are added manually as Render environment variables;
// this file never contains a real value.
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)

// Only calls cloudinary.config() when all three are actually present, so
// requiring this module never throws just because Cloudinary hasn't been
// set up yet (e.g. a fresh local checkout with no Cloudinary env vars) —
// callers check `isCloudinaryConfigured` and fail with a clear message
// instead (see mediaController.js's uploadImage).
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })
}

module.exports = { cloudinary, isCloudinaryConfigured }
