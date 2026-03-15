import express from 'express'

import jwt from 'jsonwebtoken'

const SECRET_KEY = 'your_jwt_secret_key' // In production, use env variable

class UserController 
{
    // Simulate login and return a JWT
    async login(req: express.Request, res: express.Response) {
        const { username, password } = req.body;
        // No DB check, just a dummy user
        if (username && password) {
            const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(400).json({ message: 'Username and password required' });
        }
    }

    // Protected route example
    async protected(req: express.Request, res: express.Response) {
        res.send(`Hello ${(req as any).user.username}, you have accessed a protected route!`);
    }

    async test(req: express.Request, res: express.Response) {
        res.send("USER: Test successful!")
    }
}

const userController = new UserController()
export default userController

