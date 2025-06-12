import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Middleware to authenticate users based on a JWT token stored in cookies.
 * If a valid token is found, the decoded user information is attached to `req.user`.
 * If no token is found or the token is invalid, `req.user` is set to `null`.
 *
 * @param {object} req - The HTTP request object.
 * @param {object} req.cookies - The cookies sent with the request.
 * @param {string} [req.cookies.authToken] - The JWT token used for authentication.
 * @param {object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {void} Calls `next()` to proceed to the next middleware or route handler.
 */
export function auth (req, res, next) {
  const token = req.cookies.authToken

  if (!token) {
    console.warn('No token found, user is not authenticated')
    req.user = null // Allow unauthenticated access
    return next()
  }

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message)
      req.user = null // Allow unauthenticated access
      return next()
    }
    req.user = user // Attach the decoded user object to req.user
    next()
  })
}
