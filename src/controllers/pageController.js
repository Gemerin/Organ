import { Todo } from '../models/todo.js'
import dotenv from 'dotenv'

dotenv.config()
/**
 * Encapsulates a controller.
 */
export class PageController {
  /**
   * Renders a view and sends the rendered HTML string as an HTTP response.
   * index GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      const user = req.user || null
      const todos = user ? await Todo.find({ userId: user.id }).sort({ order: 1 }).lean() : []
      res.render('index', { title: 'Home', todos, user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Renders the about page.
   * about GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async about (req, res, next) {
    res.render('about', { title: 'About' })
  }

  /**
   * Renders the terms and conditions page.
   * terms GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  terms (req, res, next) {
    res.render('terms', { title: 'Terms and Conditions' })
  }

  /**
   * Renders the login page.
   * GET /user/login.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  loginPage (req, res, next) {
    res.render('login', { title: 'Login' })
  }

  /**
   * Renders the registration page.
   * terms GET.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  registrationPage (req, res, next) {
    res.render('register', { title: 'register' })
  }
}
