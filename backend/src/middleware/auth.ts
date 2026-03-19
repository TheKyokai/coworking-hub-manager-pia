import express from 'express'
import jwt from "jsonwebtoken"

// JWT Key
const JWT_KEY = "key"

// Middleware to verify JWT
export function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) 
        return res.sendStatus(401)
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_KEY, (err: any, user: any) => {
        if (err) {
            return res.sendStatus(403);
        }
        
        (req as any).user = user;
        next();
    });
}
