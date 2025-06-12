import { Session } from '../models/timerModel.js'

/**
 * Controller for time realted operations.
 */
export class TimerController {
  /**
   * Store a session in the database.
   *
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {Function} next - The next middleware function
   */
  async storeSession (req, res, next) {
    console.log('Incoming session payload:', req.body)
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized: No user ID found.' })
      }

      const { type, duration, date, time } = req.body

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing session type.' })
      }

      if (!duration || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ error: 'Duration must be a positive number in minutes.' })
      }

      if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: 'Invalid or missing session date.' })
      }

      const session = new Session({
        type,
        duration,
        date: new Date(date),
        time,
        userId: req.user._id
      })

      const savedSession = await session.save()
      res.status(201).json(savedSession)
    } catch (error) {
      console.error('Error storing session:', error)
      next(error)
    }
  }

  /**
   * Fetches sessions for the authenticated user with pagination.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.user - The authenticated user object.
   * @param {object} req.query - The query parameters for pagination.
   * @param {number} [req.query.page=1] - The current page number.
   * @param {number} [req.query.limit=5] - The number of sessions per page.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with the paginated sessions or an error message.
   */
  async fetchSessions (req, res, next) {
    try {
      const user = req.user
      if (!user || !user._id) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' })
      }

      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5

      if (page <= 0 || limit <= 0) {
        return res.status(400).json({ error: 'Page and limit must be positive integers.' })
      }

      const skip = (page - 1) * limit

      const sessions = await Session.find({ userId: user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)

      const totalSessions = await Session.countDocuments({ userId: user._id })

      res.json({
        sessions,
        currentPage: page,
        totalPages: Math.ceil(totalSessions / limit)
      })
    } catch (error) {
      console.error('Error fetching sessions:', error)
      next(error)
    }
  }
}
