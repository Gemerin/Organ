import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { User } from '../models/user.js'
import { promisify } from 'util'

dotenv.config()

/**
 * Middleware to authenticate a token from cookies.
 * Verifies the JWT token and attaches the authenticated user to the request object.
 *
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @param {Function} next - The next middleware function.
 * @returns {void} Calls `next()` if authentication is successful, otherwise sends an error response.
 */
export async function authToken (req, res, next) {
  const token = req.cookies.authToken

  if (!token) {
    const err = new Error('Unauthorized: Please log in to access this resource.')
    err.status = 401
    return next(err)
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      const err = new Error('Forbidden: You do not have permission to access this resource.')
      err.status = 403
      return next(err)
    }

    req.user = user
    next()
  } catch (error) {
    const err = new Error('Invalid or expired token. Please log in again.')
    err.status = 401
    return next(err)
  }
}

/**
 * Generates a JWT token for a user.
 *
 * @param {object} user - The user object containing user information.
 * @param {string} user._id - The unique identifier of the user.
 * @param {string} user.username - The username of the user.
 * @returns {string} The generated JWT token.
 */
export function generateToken (user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username
    },
    process.env.SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h' // Default to 1 hour if not set
    }
  )
}
