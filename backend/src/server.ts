import express from 'express'
import cors from 'cors'

import mongoose from 'mongoose'

// Router imports
import testRouter from './routers/test-router'
import userRouter from './routers/user-router'


// Initial base setup
const app = express()
app.use(cors())
app.use(express.json())

// MongoDB setup
mongoose.connect('mongodb://127.0.0.1:27017/project_db')
const connection = mongoose.connection
connection.once('open', () => { console.log('Database connection established successfully') })


// Route setup
app.use('/test', testRouter)
app.use('/user', userRouter)




app.get('/', (req, res)=> {res.send("DEFAULT ROUTE")})

// Server start
app.listen(4000, ()=>console.log("Express running on port 4000"))