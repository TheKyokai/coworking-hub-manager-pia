import express from 'express'
import reservationController from '../controllers/reservation-controller'
import { authenticateJWT } from '../middleware/auth'
import { requireRoles } from '../middleware/role'



const reservationRouter = express.Router()
export default reservationRouter


reservationRouter.route("/get-all")
    .get(
        authenticateJWT,
        requireRoles("user", "manager"),
        reservationController.getAllReservations
    )

reservationRouter.route('/make')
    .post(
        authenticateJWT,
        requireRoles('user'),
        reservationController.makeReservation
    )

reservationRouter.route('/cancel')
    .post(
        authenticateJWT,
        requireRoles('user'),
        reservationController.cancelReservation
    )

reservationRouter.route('/confirm')
    .post(
        authenticateJWT,
        requireRoles('manager'),
        reservationController.confirmReservation
    )

reservationRouter.route('/decline')
    .post(
        authenticateJWT,
        requireRoles('manager'),
        reservationController.declineReservation
    )
