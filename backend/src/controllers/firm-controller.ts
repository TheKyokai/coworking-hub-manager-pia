import express from 'express';

import firm from '../models/firm';

class FirmController 
{
    
    getFirm = async (req: express.Request, res: express.Response) => 
    {
        try {
            const firmId = req.params.firmId;

            if (!firmId) 
                return res.status(400).json({ message: 'Matični brojr ime je obavezan' });
            
            const firmRecord = await firm.findOne({firmId: firmId});
            res.status(200).json(firmRecord);
        } catch (err) {
            res.status(500).json(null);
        }
    }
}

const firmController = new FirmController()
export default firmController
