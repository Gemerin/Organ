import express from 'express'
import { TodoController } from '../../controllers/todoController.js'
import { authToken } from '../../config/jwt.js'

const todoController = new TodoController()
export const router = express.Router()
// middleware authjwt

router.param('id', authToken, (req, res, next) => todoController.loadDoc(req, res, next))

router.get('/', authToken, (req, res, next) => todoController.fetchTodos(req, res, next))

router.post('/', authToken, (req, res, next) => todoController.createTodo(req, res, next))

router.put('/:id', authToken, (req, res, next) => todoController.updateTodo(req, res, next))

router.patch('/:id/move-up', authToken, (req, res, next) => todoController.moveTodoUp(req, res, next))

router.patch('/:id/move-down', authToken, (req, res, next) => todoController.moveTodoDown(req, res, next))

router.delete('/:id', authToken, (req, res, next) => todoController.deleteTodo(req, res, next))
