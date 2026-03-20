import express from 'express'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'
import adminController from '../controllers/admin-controller'
import workspaceController from '../controllers/workspace-controller'

const workspaceRouter = express.Router()
export default workspaceRouter


workspaceRouter.route("/register")
    .post(
        authenticateJWT,
        requireRoles("manager"),
        workspaceController.registerWorkspace
    )

workspaceRouter.route("/update")
    .post(
        authenticateJWT,
        requireRoles("manager"),
        workspaceController.updateWorkspace
    )


workspaceRouter.route("/add-private")
    .post(
        authenticateJWT,
        requireRoles("manager"),
        workspaceController.addPrivateSpace
    )

workspaceRouter.route("/update-private")
    .post(
        authenticateJWT,
        requireRoles("manager"),
        workspaceController.updatePrivateSpace
    )

workspaceRouter.route("/comment")
    .post(
        authenticateJWT,
        requireRoles("user"),
        workspaceController.commentWorkspace
    )

workspaceRouter.route("/rate")
    .post(
        authenticateJWT,
        requireRoles("user"),
        workspaceController.rateWorkspace
    )

workspaceRouter.route("/get-all")
    .get(
        workspaceController.getAllWorkspaces
    )

workspaceRouter.route("/firm/:firmId")
    .get(
        authenticateJWT,
        requireRoles("manager"),
        workspaceController.getWorkspacesByFirmId
    )

workspaceRouter.route("/pending-workspaces")
    .get(
        authenticateJWT,
        requireRoles("admin"),
        workspaceController.getPendingWorkspaces
    )

workspaceRouter.route("/get/:firmId/:workspaceName") // Potential role restriction
    .get(
        workspaceController.getWorkspace
    )