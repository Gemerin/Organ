/**
 * @jest-environment node
 */
import { TodoController } from '../src/controllers/todoController.js'
import { Todo } from '../src/models/todo.js'
import mongoose from 'mongoose'

jest.mock('../src/models/todo.js') // Mock the Todo model

describe('TodoController', () => {
  let req, res, next, todoController

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'mockUserId' }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    todoController = new TodoController()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Test for deleteTodo
  describe('deleteTodo', () => {
    it('should delete a todo and return success message', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString()
      Todo.findOneAndDelete.mockResolvedValue({
        _id: 'mockTodoId',
        text: 'Test Todo',
        completed: false,
        order: 1,
        userId: 'mockUserId'
      })

      await todoController.deleteTodo(req, res, next)

      expect(Todo.findOneAndDelete).toHaveBeenCalledWith({
        _id: req.params.id,
        userId: 'mockUserId'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Successful Deletion',
        deletedTodo: {
          _id: 'mockTodoId',
          text: 'Test Todo',
          completed: false,
          order: 1,
          userId: 'mockUserId'
        }
      })
    })
  })
  // Test for updateTodo
  describe('updateTodo', () => {
    it('should update a todo and return the updated todo', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString()
      req.body = { text: 'Updated Todo', completed: true }

      Todo.findOneAndUpdate.mockResolvedValue({
        _id: req.params.id,
        text: 'Updated Todo',
        completed: true,
        order: 1,
        userId: 'mockUserId'
      })

      await todoController.updateTodo(req, res, next)

      expect(Todo.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: req.params.id, userId: 'mockUserId' },
        { text: 'Updated Todo', completed: true },
        { new: true, runValidators: true }
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        _id: req.params.id,
        text: 'Updated Todo',
        completed: true,
        order: 1,
        userId: 'mockUserId'
      })
    })

    it('should return 404 if the todo is not found', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString()
      req.body = { text: 'Updated Todo', completed: true }

      Todo.findOneAndUpdate.mockResolvedValue(null) // Mock no todo found

      await todoController.updateTodo(req, res, next)

      expect(Todo.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: req.params.id, userId: 'mockUserId' },
        { text: 'Updated Todo', completed: true },
        { new: true, runValidators: true }
      )
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Todo Not Found' })
    })

    it('should return 400 if the text is empty', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString()
      req.body = { text: '   ', completed: true }

      await todoController.updateTodo(req, res, next)

      expect(next).toHaveBeenCalled()
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(Error)
      expect(error.status).toBe(400)
      expect(error.message).toMatch(/text cannot be empty/i)
    })
  })
})
