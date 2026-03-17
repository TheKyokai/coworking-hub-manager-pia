import express from 'express'
import userController from '../controllers/user-controller'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'
import { upload } from '../config/multer'

const userRouter = express.Router()
export default userRouter


userRouter.route('/login')
	.post(userController.login)

userRouter.route('/login-admin')
	.post(userController.loginAdmin)

userRouter.route('/register-user')
	.post(
		upload.single('profilePicture'),
		userController.registerUser
	)

userRouter.route('/register-manager')
	.post(
		upload.single('profilePicture'),
		userController.registerManager
	)

userRouter.route('/get')
	.get(
		authenticateJWT, 
		requireRoles("user", "manager", "admin"), 
		userController.getUser
	)