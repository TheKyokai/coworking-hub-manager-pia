import express from 'express';

import jwt from 'jsonwebtoken';
import user from '../models/user';
import bcrypt from 'bcryptjs';
import firm from '../models/firm';
import fs from 'fs';
import path from 'path';

const JWT_KEY = "key"; // use env variable

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
            const { userJSON, password } = req.body;

            const sentUser = JSON.parse(userJSON);

            if (sentUser.role !== 'user') {
                return res.status(400).json({ message: 'Unexpected and invalid role registration' });
            }
            // Check if user exists
            const existingUser = await user.findOne({ username: sentUser.username });
            if (existingUser) {
                return res.status(400).json({ message: 'Korisnik sa ovim korisničkim imenom postoji' });
            }
            const existingEmail = await user.findOne({ email: sentUser.email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Već postoji nalog koji je registrovan sa ovom e-mejl adresom' });
            }
            const passwordHash = await bcrypt.hash(password, 8);
            
            // Handle profile picture
            let profilePicturePath = "images/profile/default.png"

            if (req.file) 
            {
                const ext = path.extname(req.file.originalname) || ".png"

                const newFilename = `${sentUser.username}${ext}`

                const oldPath = req.file.path
                const newPath = path.join("images/profile", newFilename)

                fs.renameSync(oldPath, newPath)

                profilePicturePath = newPath
            }

            const newUser = new user({
                username: sentUser.username,
                passwordHash,
                firstName: sentUser.firstName,
                lastName: sentUser.lastName,
                email: sentUser.email,
                phoneNumber: sentUser.phoneNumber,
                role: sentUser.role,
                profilePicture: profilePicturePath,
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
            const { userJSON, firmJSON, password } = req.body;

            const sentUser = JSON.parse(userJSON);

            if (sentUser.role !== 'manager') {
                return res.status(400).json({ message: 'Unexpected and invalid role registration' });
            }
            // Check if user exists
            const existingUser = await user.findOne({ username: sentUser.username });
            if (existingUser) {
                return res.status(400).json({ message: 'Korisnik sa ovim korisničkim imenom postoji' });
            }
            const existingEmail = await user.findOne({ email: sentUser.email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Već postoji nalog koji je registrovan sa ovom e-mejl adresom' });
            }
            // Check if firm exists
            const sentFirm = JSON.parse(firmJSON);
            let firmDoc = await firm.findOne({ firmId: sentFirm.firmId });
            
            if (!firmDoc) {
                firmDoc = new firm({
                    firmId: sentFirm.firmId,
                    taxId: sentFirm.taxId,
                    name: sentFirm.name,
                    address: sentFirm.address,
                    managers: [sentUser.username],
                    status: 'pending',
                });
                await firmDoc.save();
            } else {
                // Limit check
                if (firmDoc.managers.length >= 2)
                {
                    res.status(500).json({ message: 'Neuspešna registracija. Firma već ima dva menadžera.' });
                    return;
                }
                
                // Add manager to existing firm
                if (!firmDoc.managers.includes(sentUser.username)) {
                    firmDoc.managers.push(sentUser.username);
                    await firmDoc.save();
                }
            }
            const passwordHash = await bcrypt.hash(password, 8);
            
            // Handle profile picture
            let profilePicturePath = "images/profile/default.png"

            if (req.file) 
            {
                const ext = path.extname(req.file.originalname) || ".png"

                const newFilename = `${sentUser.username}${ext}`

                const oldPath = req.file.path
                const newPath = path.join("images/profile", newFilename)

                fs.renameSync(oldPath, newPath)

                profilePicturePath = newPath
            }

            const newUser = new user({
                username: sentUser.username,
                passwordHash,
                firstName: sentUser.firstName,
                lastName: sentUser.lastName,
                email: sentUser.email,
                phoneNumber: sentUser.phoneNumber,
                role: sentUser.role,
                firmId: sentFirm.firmId,
                profilePicture: profilePicturePath,
                status: 'pending',
            });
            await newUser.save();
            res.status(201).json({ message: 'Uspešna registracija. Moći ćete da se ulogujete kad bude i odobrena.' });
        } catch (err) {
            res.status(500).json({ message: 'Neuspešna registracija.' });
        }
    }
}

const userController = new UserController()
export default userController
