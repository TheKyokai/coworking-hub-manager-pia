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

userRouter.route('/request-password-reset')
	.post(
		userController.requestPasswordReset
	)

userRouter.route('/password-reset')
	.post(
		userController.resetPassword
	)

userRouter.route('/get')
	.get(
		authenticateJWT, 
		requireRoles("user", "manager", "admin"), 
		userController.getUser
	)

userRouter.route('/pending-registrations')
	.get(
		authenticateJWT,
		requireRoles("admin"), // Subject to change
		userController.getPendingUsers
	)

userRouter.route('/all-users')
	.get(
		authenticateJWT,
		requireRoles("admin"), // Subject to change
		userController.getAllUsers
	)

userRouter.route('/get-by-username/:username')
	.get(
		authenticateJWT,
		requireRoles("admin"),
		userController.getByUsername
	)

userRouter.route('/update')
	.post(
		upload.single("profilePicture"),
		authenticateJWT,
		requireRoles("admin", "user", "manager"),
		userController.updateUser
	)