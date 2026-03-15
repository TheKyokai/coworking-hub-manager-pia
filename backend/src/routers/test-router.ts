import express from 'express'
import testController from '../controllers/test-controller'

const testRouter = express.Router()
export default testRouter

testRouter
.route('/')
.get(testController.test)




