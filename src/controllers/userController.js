import argon2 from 'argon2'
import { User } from '../models/user.js'
import { Todo } from '../models/todo.js'
import { Session } from '../models/timerModel.js'
import { cookieConfig } from '../config/cookie.js'
import { generateToken } from '../config/jwt.js'
import dotenv from 'dotenv'

dotenv.config()
const BASE_URL = process.env.BASE_URL
/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Logs in a user.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.body - The request body containing login credentials.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with the login token or an error message.
   */
  async login (req, res, next) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email }).select('+password') // Explicitly include the password field
      if (!user) {
        res.locals.flash = { type: 'error', text: 'Invalid email or password.' }
        return res.render('login', { title: 'Login' }) // Include the title variable
      }

      const match = await argon2.verify(user.password, password)
      if (!match) {
        res.locals.flash = { type: 'error', text: 'Invalid email or password.' }
        return res.render('login', { title: 'Login' }) // Include the title variable
      }

      // Generate token
      const token = generateToken({ _id: user._id, username: user.username })
      res.cookie('authToken', token, cookieConfig)
      res.redirect(BASE_URL)
    } catch (error) {
      console.error('Error during login:', error.message)
      res.locals.flash = { type: 'error', text: 'An error occurred during login. Please try again.' }
      res.redirect(BASE_URL)
    }
  }

  /**
   * Displays the user's profile.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.user - The authenticated user object.
   * @param {object} req.query - The query parameters for pagination.
   * @param {number} [req.query.page=1] - The current page number.
   * @param {number} [req.query.limit=5] - The number of sessions per page.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Renders the profile page or an error message.
   */
  async viewProfile (req, res, next) {
    try {
      const user = req.user
      if (!user) {
        const err = new Error('Forbidden: You do not have permission to access this resource.')
        err.status = 403
        return next(err)
      }
      // Fetch session history for the logged-in user
      const page = parseInt(req.query.page) || 1 // Default to page 1
      const limit = parseInt(req.query.limit) || 5 // Default to 10 sessions per page
      const skip = (page - 1) * limit

      const sessions = await Session.find({ userId: user._id })
        .sort({ date: -1, time: -1 }) // Sort by most recent
        .skip(skip)
        .limit(limit)

      const totalSessions = await Session.countDocuments({ userId: user._id })

      // Pass session history and pagination metadata to the profile view
      res.render('profile', {
        title: 'Profile',
        user,
        sessions,
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        limit
      })
    } catch (error) {
      console.error('Error in viewProfile:', error.message)
      res.locals.flash = { type: 'error', text: 'An error occurred while loading your profile.' }
      res.render('profile', { user: req.user, title: 'Profile' })
    }
  }

  /**
   * Logs out the user by clearing the authentication cookie.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Redirects to the home page.
   */
  async logout (req, res, next) {
    try {
      res.clearCookie('authToken', cookieConfig)
      res.redirect(BASE_URL)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the user's account and associated data.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.user - The authenticated user object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Redirects to the home page or returns a JSON message.
   */
  async deleteAccount (req, res, next) {
    try {
      if (!req.user) {
        const message = 'Unauthorized: Please log in to delete your account.'
        if (req.accepts('json')) {
          return res.status(401).json({ error: message })
        }
        return res.status(401).render('errors/error', {
          error: {
            status: 401,
            message,
            stack: null
          }
        })
      }

      const user = req.user
      await Todo.deleteMany({ userId: user.id })
      await User.findByIdAndDelete(user.id)
      res.clearCookie('authToken')

      res.locals.flash = { type: 'success', text: 'Account Deleted' }
      return res.redirect(`${BASE_URL}`)
    } catch (error) {
      console.error('Error deleting account:', error.message)
      next(error)
    }
  }

  /**
   * Changes the user's password.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.body - The request body containing password data.
   * @param {string} req.body.currentPassword - The user's current password.
   * @param {string} req.body.newPassword - The new password.
   * @param {string} req.body.confirmPassword - The confirmation of the new password.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Redirects to the profile page or an error message.
   */
  async changePass (req, res, next) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body

      if (!currentPassword || !newPassword || !confirmPassword) {
        const err = new Error('Bad Request: All fields are required.')
        err.status = 400
        return next(err)
      }

      if (newPassword !== confirmPassword) {
        const err = new Error('Passwords do not match.')
        err.status = 400
        return next(err)
      }

      const user = await User.findById(req.user._id).select('+password')
      if (!user) {
        const err = new Error('Unauthorized: User not found.')
        err.status = 401
        return next(err)
      }

      const isMatch = await argon2.verify(user.password, currentPassword)
      if (!isMatch) {
        const err = new Error('Bad Request: User Information Not Valid.')
        err.status = 401
        return next(err)
      }

      user.password = await argon2.hash(newPassword)
      await user.save()

      res.locals.flash = { type: 'success', text: 'Password changed successfully!' }
      res.redirect(`${BASE_URL}profile`)
    } catch (error) {
      return next(error)
    }
  }

  /**
   * Registers a new user.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.body - The request body containing registration data.
   * @param {string} req.body.username - The username of the new user.
   * @param {string} req.body.email - The email address of the new user.
   * @param {string} req.body.password - The password of the new user.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Redirects to the home page or an error message.
   */
  async register (req, res, next) {
    try {
      const { username, email, password } = req.body

      if (!username || !email || !password) {
        res.locals.flash = { type: 'error', text: 'All fields are required.' }
        return res.render('register', { title: 'Register' })
      }

      if (password.length < 6) {
        res.locals.flash = { type: 'error', text: 'Password requires minimum 6 characters.' }
        return res.render('register', { title: 'Register' })
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.locals.flash = { type: 'error', text: 'A user with this email already exists.' }
        return res.render('register', { title: 'Register' })
      }

      const hashPass = await argon2.hash(password)
      const newUser = new User({ username, email, password: hashPass })
      await newUser.save()

      res.redirect(BASE_URL)
    } catch (error) {
      console.error('Error during registration:', error.message)
      res.locals.flash = { type: 'error', text: 'An error occurred during registration. Please try again.' }
      res.redirect(`${BASE_URL}register`)
    }
  }
}
