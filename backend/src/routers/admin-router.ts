import express from 'express'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'
import adminController from '../controllers/admin-controller'

const adminRouter = express.Router()
export default adminRouter


adminRouter.route("/approve-user")
    .post(
        authenticateJWT,
        requireRoles("admin"),
        adminController.approveUser
    )


adminRouter.route("/decline-user")
    .post(
        authenticateJWT,
        requireRoles("admin"),
        adminController.declineUser
    )

    
adminRouter.route("/delete-user")
    .post(
        authenticateJWT,
        requireRoles("admin"),
        adminController.deleteUser
    )

