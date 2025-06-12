import { Todo } from '../models/todo.js'
import mongoose from 'mongoose'

/**
 * Controller for handling todo-related operations.
 */
export class TodoController {
  /**
   * Fetches a specific todo document for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {string} req.params.id - The ID of the todo to fetch.
   * @param {object} req.user - The authenticated user object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Attaches the todo document to `req.doc` or responds with an error.
   */
  async loadDoc (req, res, next) {
    try {
      const id = req.params.id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error('Bad Request: Text cannot be empty')
        err.status = 400
        return next(err)
      }

      const todoDoc = await Todo.findOne({ _id: id, userId: req.user.id })
      if (!todoDoc) {
        const err = new Error('Not Found: The todo you requested does not exist.')
        err.status = 404
        return next(err)
      }

      req.doc = todoDoc
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches all todos for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.user - The authenticated user object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Attaches the list of todos to `req.todos` or responds with an error.
   */
  async fetchTodos (req, res, next) {
    try {
      const todos = await Todo.find({ userId: req.user.id }).sort({ order: 1 })
      res.status(200).json(todos) // Send the todos as a JSON response
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new todo for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.body - The request body containing todo data.
   * @param {object} req.user - The authenticated user object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with the created todo or an error message.
   */
  async createTodo (req, res, next) {
    try {
      const maxTask = 10

      if (!req.body.text || req.body.text.trim() === '') {
        const err = new Error('Text cannot be empty or whitespace.')
        err.status = 400
        return next(err)
      }

      const todosCount = await Todo.countDocuments({ userId: req.user.id })
      if (todosCount >= maxTask) {
        const err = new Error('Task limit reached. You cannot add more than 10 tasks.')
        err.status = 400
        return next(err)
      }

      const maxOrderTodo = await Todo.findOne({ userId: req.user.id }).sort({ order: -1 })
      const newOrder = maxOrderTodo ? maxOrderTodo.order + 1 : 1

      const todo = new Todo({
        text: req.body.text.trim(),
        completed: false,
        order: newOrder,
        userId: req.user.id,
        createdAt: new Date()
      })

      const savedTodo = await todo.save()
      res.status(201).json(savedTodo)
    } catch (error) {
      if (error.name === 'ValidationError') {
        const err = new Error(error.message)
        err.status = 400
        return next(err)
      }
      next(error)
    }
  }

  /**
   * Updates an existing todo for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {object} req.body - The request body containing updated todo data.
   * @param {object} req.params - The request parameters containing the todo ID.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with the updated todo or an error message.
   */
  async updateTodo (req, res, next) {
    try {
      const { text, completed } = req.body
      // Build the update object dynamically based on the provided fields
      const updateFields = {}
      if (text !== undefined) {
        if (text.trim() === '') {
          const err = new Error('Bad Request: Text cannot be empty or whitespace.')
          err.status = 400
          return next(err)
        }
        updateFields.text = text.trim()
      }
      if (completed !== undefined) {
        updateFields.completed = completed
      }

      // Update the todo in the database
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        updateFields,
        { new: true, runValidators: true }
      )

      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo Not Found' })
      }

      res.status(200).json(updatedTodo)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ flash: { type: 'error', text: error.message } })
      }
      next(error)
    }
  }

  /**
   * Moves a todo up in the order for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {string} req.params.id - The ID of the todo to move up.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with a success message or an error message.
   */
  async moveTodoUp (req, res, next) {
    try {
      const { id } = req.params

      const currentTodo = await Todo.findOne({ _id: id, userId: req.user.id })
      if (!currentTodo) {
        return res.status(404).json({ error: 'Todo Not Found' })
      }

      // Find the todo above (with a smaller order value)
      const aboveTodo = await Todo.findOne({ userId: req.user.id, order: { $lt: currentTodo.order } }).sort({ order: -1 })
      if (!aboveTodo) {
        const err = new Error('Todo is already at the top')
        err.status = 400
        return next(err)
      }

      // Swap the order values
      const tempOrder = currentTodo.order
      currentTodo.order = aboveTodo.order
      aboveTodo.order = tempOrder

      // Save both todos
      await currentTodo.save()
      await aboveTodo.save()

      res.status(200).json({ message: 'Todo moved up successfully', currentTodo, aboveTodo })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Moves a todo down in the order for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {string} req.params.id - The ID of the todo to move down.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with a success message or an error message.
   */
  async moveTodoDown (req, res, next) {
    try {
      const { id } = req.params

      // Find the current todo for the logged-in user
      const currentTodo = await Todo.findOne({ _id: id, userId: req.user.id })
      if (!currentTodo) {
        return res.status(404).json({ error: 'Todo Not Found' })
      }

      // Find the todo below (with a larger order value) for the same user
      const belowTodo = await Todo.findOne({ userId: req.user.id, order: { $gt: currentTodo.order } }).sort({ order: 1 })
      if (!belowTodo) {
        const err = new Error('Todo is already at the bottom')
        err.status = 400
        return next(err)
      }

      // Swap the order values
      const tempOrder = currentTodo.order
      currentTodo.order = belowTodo.order
      belowTodo.order = tempOrder

      // Save both todos
      await currentTodo.save()
      await belowTodo.save()

      res.status(200).json({ message: 'Todo moved down successfully', currentTodo, belowTodo })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a todo for the authenticated user.
   *
   * @param {object} req - The HTTP request object.
   * @param {string} req.params.id - The ID of the todo to delete.
   * @param {object} req.user - The authenticated user object.
   * @param {object} res - The HTTP response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} Responds with a success message and the deleted todo, or an error message.
   */
  async deleteTodo (req, res, next) {
    try {
      const { id } = req.params

      // Validate the ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        console.error('Invalid or missing ID:', id)
        return res.status(400).json({ error: 'Invalid or missing ID' })
      }

      console.log('Delete Todo ID:', id)
      console.log('User ID:', req.user.id)

      // Find and delete the todo
      const deleteTodo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id })

      if (!deleteTodo) {
        console.log('Todo not found or user mismatch')
        return res.status(404).json({ error: 'Todo Not Found' })
      }

      console.log('Deleted Todo:', deleteTodo)
      res.status(200).json({ message: 'Successful Deletion', deletedTodo: deleteTodo })
    } catch (error) {
      console.error('Error in deleteTodo:', error)
      next(error)
    }
  }
}
