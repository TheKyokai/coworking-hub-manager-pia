import express from 'express'

import jwt from 'jsonwebtoken'
import user from '../models/user';
import bcrypt from 'bcryptjs';

const JWT_KEY = "key" // use env variable

class UserController 
{
    
    login = async (req: express.Request, res: express.Response) => 
    {
        const { username, password } = req.body;        
        const userData = await user.findOne({ username: username });

        if (userData == null)
        {
            res.status(400).json({
                message: 'Login unsuccessful: User with that username does not exist',
                token: ''
            });
            return;
        }

        // Compare password with hash
        const passwordMatch = await bcrypt.compare(password, userData.passwordHash!);
        if (!passwordMatch) 
        {
            res.status(400).json({
                message: 'Login unsuccessful: Invalid credentials',
                token: ''
            });
            return;
        }

        if (userData.role == "admin")
        {
            res.status(400).json({
                message: 'Neuspešna prijava. Zabranjen pristup',
                token: ''
            });
            return;
        }

        if (userData.status == "pending")
        {
            res.status(400).json({
                message: 'Vaša registracija još uvek nije odobrena.'
            });
            return;
        }


        const role = userData.role;
        const token = jwt.sign({ username, role }, JWT_KEY, { expiresIn: '2h' });
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    }

    loginAdmin = async (req: express.Request, res: express.Response) =>
    {
        const { username, password } = req.body;
        const userData = await user.findOne({ username: username });

        if (userData == null)
        {
            res.status(400).json({
                message: 'Login unsuccessful: User with that username does not exist',
                token: ''
            });
            return;
        }

        // Admin check
        if (userData.role != 'admin')
        {
            res.status(400).json({
                message: 'Login unsuccessful: User not authorized',
                token: ''
            });
            return;
        }

        // Compare password with hash
        const passwordMatch = await bcrypt.compare(password, userData.passwordHash!);
        if (!passwordMatch) 
        {
            res.status(400).json({
                message: 'Login unsuccessful: Invalid credentials',
                token: ''
            });
            return;
        }
        const role = userData.role;
        const token = jwt.sign({ username, role }, JWT_KEY, { expiresIn: '2h' });
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    }

    getUser = async (req: express.Request, res: express.Response) =>
    {
        const { username } = (req as any).user

        const userData = await user.findOne({username: username})
        if (userData == null)
            res.status(401).json(null)
        else
            res.status(200).json(userData);
    }

    registerUser = async (req: express.Request, res: express.Response) => 
    {
        try {
            const { username, password, firstName, lastName, email, phoneNumber, role } = req.body;
            if (role !== 'user') {
                return res.status(400).json({ message: 'Unexpected and invalid role registration' });
            }
            // Check if user exists
            const existingUser = await user.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Korisnik sa ovim korisničkim imenom postoji' });
            }
            const existingEmail = await user.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Već postoji nalog koji je registrovan sa ovom e-mejl adresom' });
            }
            const passwordHash = await bcrypt.hash(password, 8);
            const newUser = new user({
                username,
                passwordHash,
                firstName,
                lastName,
                email,
                phoneNumber,
                role,
                status: 'pending',
            });
            await newUser.save();
            res.status(201).json({ message: 'Uspešna registracija. Moći ćete da se ulogujete kad bude i odobrena.' });
        } catch (err) {
            res.status(500).json({ message: 'Neuspešna registracija.' });
        }
    }

    registerManager = async (req: express.Request, res: express.Response) => 
    {
        try {
            const { username, password, firstName, lastName, email, phoneNumber, role, firm } = req.body;
            if (role !== 'manager') {
                return res.status(400).json({ message: 'Unexpected and invalid role registration' });
            }
            // Check if user exists
            const existingUser = await user.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Korisnik sa ovim korisničkim imenom postoji' });
            }
            const existingEmail = await user.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Već postoji nalog koji je registrovan sa ovom e-mejl adresom' });
            }
            // Check if firm exists
            const Firm = require('../models/firm').default;
            let firmDoc = await Firm.findOne({ firmId: firm.firmId });
            if (!firmDoc) {
                firmDoc = new Firm({
                    firmId: firm.firmId,
                    taxId: firm.taxId,
                    name: firm.name,
                    address: firm.address,
                    managers: [username],
                    status: 'pending',
                });
                await firmDoc.save();
            } else {
                // Add manager to existing firm
                if (!firmDoc.managers.includes(username)) {
                    firmDoc.managers.push(username);
                    await firmDoc.save();
                }
            }
            const passwordHash = await bcrypt.hash(password, 8);
            const newUser = new user({
                username,
                passwordHash,
                firstName,
                lastName,
                email,
                phoneNumber,
                role,
                firmId: firm.firmId,
                status: 'pending',
            });
            await newUser.save();
            res.status(201).json({ message: 'Uspešna registracija. Moći ćete da se ulogujete kad bude i odobrena.' });
        } catch (err) {
            res.status(500).json({ message: 'Neuspešna registracija.' });
        }
    }

    // const hashedPassword = await bcrypt.hash(password, 8)
}

const userController = new UserController()
export default userController

