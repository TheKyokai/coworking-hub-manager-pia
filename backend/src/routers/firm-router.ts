import express from 'express'
import firmController from '../controllers/firm-controller'


const firmRouter = express.Router()
export default firmRouter


firmRouter.route("/get/:firmId")
    .get(
        firmController.getFirm
    )
