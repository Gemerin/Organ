import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { connectToDB } from './config/mongoose.js'
import { router as pageRoute } from './routes/pageRoute.js'
/* import { router as userRoute } from './routes/userRoute.js'
 */import { router as todoRoute } from './routes/api/todoRoute.js'
import { router as timerRoute } from './routes/api/timerRoute.js'

dotenv.config()

/**
 * Starts the Express server and sets up middleware, routes, and error handling.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} Starts the server and listens on the specified port.
 */
async function startServer () {
  const app = express()
  const PORT = process.env.PORT || 3000
  try {
    await connectToDB()

    // Fix for __dirname in ES modules
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    // Serve static files from the "public" directory
    app.use(express.static(path.join(__dirname, '../public')))

    // middleware
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            mediaSrc: [
              "'self'",
              'https://dn720302.ca.archive.org',
              'https://dn721802.ca.archive.org',
              'https://dn720006.ca.archive.org',
              'https://archive.org'
            ]
          }
        }
      })
    ) // Use helmet for security

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    // Middleware to parse cookies
    app.use(cookieParser())

    // Rate limiting middleware
    const limiter = rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10, // Limit each IP to 100 requests per windowMs
      /**
       * Custom handler function for rate-limited requests.
       *
       * @param {import('express').Request} req - The incoming HTTP request.
       * @param {import('express').Response} res - The HTTP response used to return the 429 page.
       */
      handler: (req, res) => {
        res.status(429).sendFile(path.join(__dirname, '../public/error/429.html'))
      }
      // message: 'Too many login attempts, please try again after 10 minutes.'
    })
    app.post('/login', limiter)
    app.post('/register', limiter)

    // Initialize flash as null by default
    app.use((req, res, next) => {
      res.locals.flash = res.locals.flash || {} // Ensure flash is always initialized
      next()
    })

    // Routes
    app.use('/', pageRoute)
    app.use('/api/todo', todoRoute)
    app.use('/api/sessions', timerRoute)

    // 404 error handler
    app.use((req, res, next) => {
      const err = new Error('Not Found')
      err.status = 404
      next(err)
    })

    // General error handler
    app.use((err, req, res, next) => {
      console.error(err.stack)
      const status = err.status || 500
      let file = '500.html'

      // Handle API requests with JSON
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(status).json({ error: err.message || 'Unexpected error' })
      }

      if (status === 401) file = '401.html'
      else if (status === 403) file = '403.html'
      else if (status === 404) file = '404.html'
      else if (status === 400) file = '400.html'

      res.status(status).sendFile(path.join(__dirname, '../public/error', file))
    })

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start the server:', error)
    process.exit(1)
  }
}
await startServer()
