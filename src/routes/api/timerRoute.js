import express from 'express'
import { TimerController } from '../../controllers/timerController.js'
import { authToken } from '../../config/jwt.js'

const timerController = new TimerController()
export const router = express.Router()

router.post('/', authToken, (req, res, next) => timerController.storeSession(req, res, next))

router.get('/', authToken, (req, res, next) => timerController.fetchSessions(req, res, next))
