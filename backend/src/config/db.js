const mongoose = require('mongoose')

// Reusable connection helper — reads MONGODB_URI from process.env (already
// loaded by dotenv in server.js) and never logs or interpolates the URI
// itself, on success or failure, since it carries the database credentials.
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env before starting the server.')
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
  } catch (error) {
    // The driver's own error can echo back connection details on some
    // failure types, so only a generic message ever reaches the console
    // or the thrown error — never `error.message` itself.
    throw new Error('Failed to connect to MongoDB. Check MONGODB_URI and Atlas network access settings.')
  }
}

module.exports = connectDB
