// Last-resort safety net — only reached if a route handler threw/rejected
// without catching it itself. Never leaks the underlying error (stack
// trace, MongoDB error text, etc.) to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Not found' })
}

module.exports = { errorHandler, notFoundHandler }
