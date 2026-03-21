import express from 'express';
import workspace from '../models/workspace';
import firm from '../models/firm';
import reservation from '../models/reservation';



const JWT_KEY = "key"; // use env variable

class WorkspaceController 
{
    
    registerWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const sentWorkspace = req.body.workspace;

            if (!sentWorkspace)
                return res.status(400).json({message: "Nisu poslati podaci za registraciju radnog prostora"});

            const firmData = await firm.findOne({firmId: sentWorkspace.firmId});
            if (!firmData)
                return res.status(400).json({message: "Ne postoji firma sa ovim matičnim brojem"});
            
            const workspaceData = await workspace.findOne({firmId: sentWorkspace.firmId, name: sentWorkspace.name});
            if (workspaceData)
                return res.status(400).json({message: "Firma već sadrži radni prostor sa ovim imenom"});

            const newWorkspace = new workspace({
                firmId: sentWorkspace.firmId,
                name: sentWorkspace.name,
                pricePerHour: sentWorkspace.pricePerHour,
                capacity: sentWorkspace.capacity,
                maximumViolations: sentWorkspace.maximumViolations,
                description: sentWorkspace.description,
                address: sentWorkspace.address,
                city: sentWorkspace.city,
                lat: sentWorkspace.lat,
                lon: sentWorkspace.lon,
                status: 'pending',
                comments: [],
                ratings: []
            });
            await newWorkspace.save();
            res.status(200).json({message: "Uspešno je poslat zahtev za registraciju radnog prostora"});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Doslo je do greske pri registraciji radnog prostora"});
        }
    }

    updateWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const sentWorkspace = req.body.workspace;

            if (!sentWorkspace)
                return res.status(400).json({message: "Neophodno je poslati nove podatke"});
            
            const workspaceRecord = await workspace.findOne({firmId: sentWorkspace.firmId, name: sentWorkspace.name});
            if (!workspaceRecord)
                return res.status(400).json({message: "Nije pronađen ovaj radni prostor"});

            workspaceRecord.description = sentWorkspace.description;
            workspaceRecord.pricePerHour = sentWorkspace.pricePerHour;
            workspaceRecord.maximumViolations = sentWorkspace.maximumViolations;
            workspaceRecord.city = sentWorkspace.city;
            workspaceRecord.address = sentWorkspace.address;
            workspaceRecord.lat = sentWorkspace.lat;
            workspaceRecord.lon = sentWorkspace.lon;
            
            await workspaceRecord.save();
            res.status(200).json({ message: 'Radni prostor je uspešno ažuriran' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri ažuriranju radnog prostora' });
        }
    }

    addPrivateSpace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { workspaceName, firmId, spaceName, type, capacity, description, pricePerHour} = req.body;
            
            const workspaceRecord = await workspace.findOne({firmId: firmId, name: workspaceName});
            
            if (!workspaceRecord)
                return res.status(400).json({message: "Nije pronađen ovaj radni prostor"});

            if (type !== 'conference' && type !== 'office')
                return res.status(400).json({message: "Ovaj tip privatnog radnog prostora nije podržan"});

            let nameUsed = false;
            workspaceRecord.privateSpaces.forEach((space: any) => {if (space.name === spaceName) nameUsed = true;});
            
            if (nameUsed)
                return res.status(400).json({message: "Ovo ime je već iskorišćeno u okviru radnog prostora"});

            await workspace.updateOne(
                {firmId: firmId, name: workspaceName},
                {$push: {privateSpaces: { spaceName: spaceName, type: type, capacity: capacity, description: description, pricePerHour: pricePerHour }}});
            res.status(200).json({ message: 'Privatni radni prostor je uspešno dodat' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri dodavanju privatnog radnog prostora' });
        }
    }

    updatePrivateSpace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const {workspaceName, firmId, spaceName, newDescription, newCapacity, newPricePerHour, newType} = req.body;

            const workspaceRecord = await workspace.findOne({firmId: firmId, name: workspaceName});
            if (!workspaceRecord)
                return res.status(400).json({message: "Nije pronađen ovaj radni prostor"});

            await workspace.updateOne({firmId: firmId, name: workspaceName},
                {$set: { "privateSpaces.$[space].description": newDescription, "privateSpaces.$[space].capacity": newCapacity, "privateSpaces.$[space].pricePerHour": newPricePerHour, "privateSpaces.$[space].type": newType }},
                {arrayFilters: [{"space.spaceName": spaceName}]}
            );
            
            res.status(200).json({ message: 'Radni prostor je uspešno ažuriran' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri ažuriranju radnog prostora' });
        }
    }

    
    commentWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { workspaceName, firmId, comment, username} = req.body;
            
            const workspaceRecord = await workspace.findOne({firmId: firmId, name: workspaceName});
            
            if (!workspaceRecord)
                return res.status(400).json({message: "Nije pronađen ovaj radni prostor"});

            let commentCount = 0;
            workspaceRecord.comments.forEach((comment: any) => { if (comment.username === username) commentCount++; });

            const confirmedReservationsCount = await reservation.countDocuments({
                username: username,
                firmId: firmId,
                workspaceName: workspaceName,
                status: "confirmed"
            });

            if (commentCount >= confirmedReservationsCount) {
                return res.status(400).json({
                    message: "Ne možete ostaviti više komentara nego što imate potvrđenih rezervacija"
                });
            }


            await workspace.updateOne({firmId: firmId, name: workspaceName}, {$push: {comments: {comment: comment, username: username, datetime: new Date()}}});
        
            res.status(200).json({ message: 'Radni prostor je uspešno komentarisan' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri komentarisanju radnog prostora' });
        }
    }

    rateWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const { workspaceName, firmId, ratingType, username} = req.body;
            
            const workspaceRecord = await workspace.findOne({firmId: firmId, name: workspaceName});
            
            if (!workspaceRecord)
                return res.status(400).json({message: "Nije pronađen ovaj radni prostor"});

            let ratingCount = 0;
            workspaceRecord.ratings.forEach((rating: any) => { if (rating.username === username) ratingCount++; });
                const confirmedReservationsCount = await reservation.countDocuments({
                username: username,
                firmId: firmId,
                workspaceName: workspaceName,
                status: "confirmed"
            });

            if (ratingCount >= confirmedReservationsCount) {
                return res.status(400).json({
                    message: "Ne možete ostaviti više ocena nego što imate potvrđenih rezervacija"
                });
            }

            await workspace.updateOne({firmId: firmId, name: workspaceName}, {$push: {ratings: {rating: ratingType, username: username}}});
        
            res.status(200).json({ message: 'Radni prostor je uspešno ocenjen' });
        } catch (err) {
            res.status(500).json({ message: 'Greška pri ocenjivanju radnog prostora' });
        }
    }

    getAllWorkspaces = async (req: express.Request, res: express.Response) =>
    {
        try {
            const allWorkspaces = await workspace.find();
            res.status(200).json(allWorkspaces);
        } catch (err) {
            res.status(500).json(null);
        }
    }

    getWorkspacesByFirmId = async (req: express.Request, res: express.Response) =>
    {
        try {
            const firmId = req.params.firmId;
            
            if (!firmId)
                return res.status(400).json(null);

            const workspaceData = await workspace.find({ firmId: firmId });
            res.status(200).json(workspaceData);
        } catch (err) {
            res.status(500).json(null);
        }
    }

    getPendingWorkspaces = async (req: express.Request, res: express.Response) =>
    {
        try {
            const pendingWorkspaces = await workspace.find({ status: 'pending' });
            res.status(200).json(pendingWorkspaces);
        } catch (err) {
            res.status(500).json(null);
        }
    }

    getWorkspace = async (req: express.Request, res: express.Response) =>
    {
        try {
            const firmId = req.params.firmId;
            const workspaceName = req.params.workspaceName;
            
            if (!firmId || !workspaceName)
                return res.status(401).json(null);

            
            const workspaceData = await workspace.findOne({firmId: firmId, name: workspaceName});
            if (workspaceData == null)
                res.status(401).json(null)
            else
                res.status(200).json(workspaceData);
        } catch (err) {
            res.status(500).json(null);
        }
    }



    // TODO: Implement later
    uploadWorkspacePicture = async (req: express.Request, res: express.Response) =>
    {

    }

    deleteWorkspacePicture = async (req: express.Request, res: express.Response) =>
    {

    }

}

const workspaceController = new WorkspaceController()
export default workspaceController
