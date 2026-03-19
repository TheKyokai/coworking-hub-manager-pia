import express from 'express'
import cors from 'cors'
import path from 'path'

import mongoose from 'mongoose'

// Router imports
import userRouter from './routers/user-router'
import adminRouter from './routers/admin-router'
import workspaceRouter from './routers/workspace-router'


// Initial base setup
const app = express();
app.use(cors());
app.use(express.json());


// MongoDB setup
mongoose.connect('mongodb://127.0.0.1:27017/project_db');
const connection = mongoose.connection;
connection.once('open', () => { console.log('Database connection established successfully') });


// Route setup
app.use('/images', express.static(path.join(__dirname, "../images")));
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/workspace', workspaceRouter);


// Default route just in case for testing 
app.get('/', (req, res)=> {res.send("DEFAULT ROUTE")});

// Server start
app.listen(4000, ()=>console.log("Express running on port 4000"));