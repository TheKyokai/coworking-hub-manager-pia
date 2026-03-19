import express from 'express';

import jwt from 'jsonwebtoken';
import user from '../models/user';
import bcrypt from 'bcryptjs';
import firm from '../models/firm';
import fs from 'fs';
import path from 'path';
import workspace from '../models/workspace';

const JWT_KEY = "key"; // use env variable

class AdminController 
{
    
    approveUser = async (req: express.Request, res: express.Response) => 
    {
        try {
            const { username } = req.body;

            if (!username) 
                return res.status(400).json({ message: 'Korisničko ime je obavezno' });
            
            const userData = await user.findOne({ username: username });

            if (!userData) 
                return res.status(404).json({ message: 'Korisnik nije pronađen' });
            
            userData.status = 'approved';
            await userData.save();

            if (userData.role === 'manager' && userData.firmId) {
                const firmData = await firm.findOne({ firmId: userData.firmId });
                if (firmData && firmData.status !== 'approved') {
                    firmData.status = 'approved';
                    await firmData.save();
                }
            }

            res.status(200).json({ message: 'Korisnik je uspešno odobren' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri odobravanju korisnika' });
        }
    }

    declineUser = async (req: express.Request, res: express.Response) => 
    {
        try {
            const { username } = req.body;

            if (!username) 
                return res.status(400).json({ message: 'Korisničko ime je obavezno' });
            
            const userData = await user.findOne({ username: username });

            if (!userData) 
                return res.status(404).json({ message: 'Korisnik nije pronađen' });
            
            
            if (userData.profilePicture && userData.profilePicture !== 'images/profile/default profile.png') {
                const profilePicturePath = path.join(process.cwd(), userData.profilePicture);
                if (fs.existsSync(profilePicturePath))
                    fs.unlinkSync(profilePicturePath);
            }

            
            if (userData.role === 'manager' && userData.firmId) {
                const firmData = await firm.findOne({ firmId: userData.firmId });
                if (firmData) {
                    if (firmData.status === 'approved') {
                        firmData.managers = firmData.managers.filter(m => m !== username);
                        await firmData.save();
                    } else {
                        const otherManagers = await user.countDocuments({
                            firmId: userData.firmId,
                            role: 'manager',
                            username: { $ne: username },
                            status: { $in: ['pending', 'approved'] }
                        });

                        if (otherManagers === 0)
                            await firm.deleteOne({ firmId: userData.firmId });
                    }
                }
            }

            await user.deleteOne({ username: username });

            res.status(200).json({ message: 'Korisnik je uspešno odbijen i obrisan' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri odbijanju korisnika' });
        }
    }

    deleteUser = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { username } = req.body;

            if (!username)
                return res.status(400).json({ message: 'Korisničko ime je obavezno' });

            const userData = await user.findOne({ username: username });

            if (!userData)
                return res.status(404).json({ message: 'Korisnik nije pronađen' });

            if (userData.profilePicture && userData.profilePicture !== 'images/profile/default profile.png') {
                const profilePicturePath = path.join(process.cwd(), userData.profilePicture);
                if (fs.existsSync(profilePicturePath))
                    fs.unlinkSync(profilePicturePath);
            }

            
            if (userData.role === 'manager' && userData.firmId) {
                const firmData = await firm.findOne({ firmId: userData.firmId });
                if (firmData && firmData.status === 'approved') {
                    firmData.managers = firmData.managers.filter(m => m !== username);
                    await firmData.save();
                }
            }

            await user.deleteOne({ username: username });

            res.status(200).json({ message: 'Korisnik je uspešno obrisan' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri brisanju korisnika' });
        }
    }

    approveWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { firmId, workspaceName } = req.body;

            if (!firmId || !workspaceName)
                return res.status(400).json({ message: 'Matični broj firme i ime radnog prostora su obavezni' });

            const workspaceData = await workspace.findOne({ 
                firmId: firmId, 
                name: workspaceName 
            });

            if (!workspaceData)
                return res.status(404).json({ message: 'Radni prostor nije pronađen' });

            workspaceData.status = 'approved';
            await workspaceData.save();

            res.status(200).json({ message: 'Radni prostor je uspešno odobren' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri odobravanju radnog prostora' });
        }
    }

    declineWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { firmId, workspaceName } = req.body;

            if (!firmId || !workspaceName)
                return res.status(400).json({ message: 'Matični broj firme i ime radnog prostora su obavezni' });

            const workspaceData = await workspace.findOne({ 
                firmId: firmId, 
                name: workspaceName 
            });

            if (!workspaceData)
                return res.status(404).json({ message: 'Radni prostor nije pronađen' });

            // Delete workspace pictures if they exist
            // if (workspaceData.pictures) 
            //     workspaceData.pictures.forEach((picturePath: string) => {
            //         const fullPath = path.join(process.cwd(), picturePath);
            //         if (fs.existsSync(fullPath))
            //             fs.unlinkSync(fullPath);
            //     });
            

            // Delete the workspace
            await workspace.deleteOne({ 
                firmId: firmId, 
                name: workspaceName 
            });

            res.status(200).json({ message: 'Radni prostor je uspešno odbijen i obrisan' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri odbijanju radnog prostora' });
        }
    }

}

const adminController = new AdminController()
export default adminController
