// req.admin is populated by requireAuth with only safe fields (id/email/role).
async function getMe(req, res) {
  return res.status(200).json({ success: true, admin: req.admin })
}

module.exports = { getMe }
