import express from 'express'
import { PageController } from '../controllers/pageController.js'
import { UserController } from '../controllers/userController.js'

import { authToken } from '../config/jwt.js'
import { auth } from '../middleware/auth.js'

export const router = express.Router()
const pageController = new PageController()
const userController = new UserController()

// Page Routes

router.get('/', auth, (req, res, next) => pageController.index(req, res, next))

router.get('/terms', (req, res, next) => pageController.terms(req, res, next))

router.get('/about', (req, res, next) => pageController.about(req, res, next))

router.get('/register', (req, res, next) => pageController.registrationPage(req, res, next))

router.get('/login', (req, res, next) => pageController.loginPage(req, res, next))

// User Routes

router.post('/login', (req, res, next) => userController.login(req, res, next))

router.post('/register', (req, res, next) => userController.register(req, res, next))

router.post('/logout', (req, res, next) => userController.logout(req, res, next))

router.post('/change-password', authToken, (req, res, next) => userController.changePass(req, res, next))

router.post('/delete-account', authToken, (req, res, next) => userController.deleteAccount(req, res, next))

router.get('/profile', authToken, (req, res, next) => userController.viewProfile(req, res, next))
