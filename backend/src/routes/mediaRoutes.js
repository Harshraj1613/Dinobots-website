const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { validateCategory, uploadSingleImage } = require('../middleware/upload')
const { uploadImage, listMedia, deleteMedia } = require('../controllers/mediaController')

const router = express.Router()

router.use(requireAuth)

router.get('/', listMedia)
router.post('/upload/:category', validateCategory, uploadSingleImage, uploadImage)
router.delete('/:category/:filename', deleteMedia)

module.exports = router
