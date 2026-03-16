import express from 'express'
import userController from '../controllers/user-controller'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'

const userRouter = express.Router()
export default userRouter


userRouter.route('/login')
	.post(userController.login)

userRouter.route('/login-admin')
	.post(userController.loginAdmin)

userRouter.route('/regiter-user')
	.post(userController.registerUser)

userRouter.route('/register-manager')
	.post(userController.registerManager)

userRouter.route('/get')
	.get(
		authenticateJWT, 
		requireRoles("user", "manager", "admin"), 
		userController.getUser
	)