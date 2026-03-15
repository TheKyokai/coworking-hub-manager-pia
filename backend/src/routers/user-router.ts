import express from 'express'
import userController from '../controllers/user-controller'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'

const userRouter = express.Router()
export default userRouter

// Public test route
userRouter.route('/')
	.get(userController.test)

// Login route (returns JWT)
userRouter.route('/login')
	.post(userController.login)

// Protected route (requires JWT)
userRouter.route('/protected')
	.get(
		authenticateJWT, 
		requireRoles("user", "manager"), 
		userController.protected
	)