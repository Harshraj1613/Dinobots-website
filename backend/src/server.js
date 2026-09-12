require('dotenv').config()

const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const teamRoutes = require('./routes/teamRoutes')
const projectRoutes = require('./routes/projectRoutes')
const achievementRoutes = require('./routes/achievementRoutes')
const eventRoutes = require('./routes/eventRoutes')
const eventJoinRequestRoutes = require('./routes/eventJoinRequestRoutes')
const joinRequestRoutes = require('./routes/joinRequestRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const activityRoutes = require('./routes/activityRoutes')
const mediaRoutes = require('./routes/mediaRoutes')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

async function startServer() {
  // The server must never come up without a working database connection —
  // connectDB() throws (without ever logging the URI) if it can't connect,
  // and that failure is what stops app.listen() from ever being called.
  try {
    await connectDB()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }

  const app = express()

  app.use(cors({ origin: CLIENT_URL, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  // Uploaded media — served as plain static files, never executed.
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Dinobots backend is running' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api', teamRoutes)
  app.use('/api', projectRoutes)
  app.use('/api', achievementRoutes)
  app.use('/api', eventRoutes)
  app.use('/api', eventJoinRequestRoutes)
  app.use('/api', joinRequestRoutes)
  app.use('/api', settingsRoutes)
  app.use('/api/admin/dashboard', dashboardRoutes)
  app.use('/api/admin/activity', activityRoutes)
  app.use('/api/admin/media', mediaRoutes)

  app.use('/api', notFoundHandler)
  app.use(errorHandler)

  const server = app.listen(PORT, () => {
    console.log(`Dinobots backend listening on port ${PORT}`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Set a different PORT in .env and try again.`)
    } else {
      console.error('Failed to start server:', err.message)
    }
    process.exit(1)
  })
}

startServer()
