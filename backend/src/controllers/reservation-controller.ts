import express from 'express';
import reservation from '../models/reservation';
import workspace from '../models/workspace';


class ReservationController 
{
    getAllReservations = async (req: express.Request, res: express.Response) => 
    {
        try {
            const reservations = await reservation.find();
            res.status(200).json(reservations);
        } catch (err) {
            res.status(500).json(null);
        }
    }

    // Check date validity and fix open space res (possibly fixed)
    makeReservation = async (req: express.Request, res: express.Response) => 
    {
        try {
            const {firmId, workspaceName, type, privateSpaceName, username, startDate, endDate} = req.body;

            if (!firmId || !workspaceName || !type || (type === 'private' && !privateSpaceName) || !username || !startDate || !endDate)
                return res.status(400).json({message: "Nisu prosleđeni svi potrebni podaci"});

            
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start >= end)
                return res.status(400).json({message: "Završni datum mora biti nakon početnog"});

            if (start < new Date())
                return res.status(400).json({message: "Početni datum ne može biti u prošlosti"});


            const workspaceRecord = await workspace.findOne({ name: workspaceName, firmId: firmId });
            if (!workspaceRecord)
                return res.status(500).json("Došlo je do greške prilikom rezervisanja");


            // Overlap check
            if (type === 'private')
            {
                const existingReservation = await reservation.findOne({
                    firmId: firmId,
                    workspaceName: workspaceName,
                    status: 'active',
                    startDate: { $lt: end },
                    endDate: { $gt: start }
                });
                if (existingReservation)
                    return res.status(400).json({message: "Tokom izabranog vremena već postoji rezervacija"});
            }
            else
            {
                const reservationCount = await reservation.countDocuments({
                    firmId: firmId,
                    workspaceName: workspaceName,
                    privateSpaceName: privateSpaceName,
                    status: 'active',
                    startDate: { $lt: end },
                    endDate: { $gt: start }
                });

                if (reservationCount > workspaceRecord.capacity!)
                    return res.status(400).json({message: "Tokom izabranog vremena nema slobodnih stolova"});
            }

            const declinedCount = await reservation.countDocuments({
                firmId: firmId,
                workspaceName: workspaceName,
                username: username,
                status: 'declined'
            });

            if (declinedCount >= workspaceRecord.maximumViolations!)
                return res.status(400).json({message: "Rezervacija je neuspešna jer ste dostigli maksimalan broj kaznenih prekršaja"});
            
            const newReservation = new reservation({
                firmId,
                workspaceName,
                type,
                privateSpaceName: type === 'private' ? privateSpaceName : '',
                username,
                status: 'active',
                startDate: start,
                endDate: end,
                reservationDate: new Date()
            });

            await newReservation.save();
            res.status(200).json({message: "Rezervacija je uspešna"});
        } catch (err) {
            res.status(500).json("Došlo je do greške prilikom rezervisanja");
        }
    }

    cancelReservation = async (req: express.Request, res: express.Response) => 
    {
        try {
            const {firmId, workspaceName, type, privateSpaceName, username, startDate, endDate} = req.body;

            if (!firmId || !workspaceName || !type || !privateSpaceName || !username || !startDate || !endDate)
                return res.status(400).json({message: "Nisu prosleđeni svi potrebni podaci"});


            let reservationRecord = null;
            if (type == 'open')
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });
            else
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, privateSpaceName: privateSpaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });
            

            if (!reservationRecord)
                return res.status(400).json({message: "Rezervacija nije pronadjena"});

            // 12hr check
            const now = new Date();
            const resStart = new Date(reservationRecord.startDate!);
            const TWELVE_HOURS = 12 * 60 * 60 * 1000;
            if (resStart.getTime() - now.getTime() < TWELVE_HOURS)
                return res.status(400).json({message: "Kasno je za otkazivanje rezervacije"});

            reservationRecord.status = 'cancelled';
            await reservationRecord.save();
            res.status(200).json({message: "Rezervacija je uspešno otkazana"});
        } catch (err) {
            res.status(500).json("Došlo je do greške prilikom otkazivanja rezervacije");
        }
    }

    confirmReservation = async (req: express.Request, res: express.Response) => 
    {
        try {
            const {firmId, workspaceName, type, privateSpaceName, username, startDate, endDate} = req.body;

            if (!firmId || !workspaceName || !type || !privateSpaceName || !username || !startDate || !endDate)
                return res.status(400).json({message: "Nisu prosleđeni svi potrebni podaci"});


            let reservationRecord = null;
            if (type == 'open')
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });
            else
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, privateSpaceName: privateSpaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });

            if (!reservationRecord)
                return res.status(400).json({message: "Rezervacija nije pronadjena"});

            // 10 min window after start check
            const now = new Date();
            const resStart = new Date(reservationRecord.startDate!);

            const TEN_MIN = 10 * 60 * 1000;
            const diff = now.getTime() - resStart.getTime();

            if (diff < TEN_MIN)
                return res.status(400).json({message: "Rano je za potvrdu rezervacije"});


            reservationRecord.status = 'confirmed';
            await reservationRecord.save();
            res.status(200).json({message: "Rezervacija je uspešno potvrđena"});
        } catch (err) {
            res.status(500).json("Došlo je do greške prilikom potvrde rezervacije");
        }
    }

    declineReservation = async (req: express.Request, res: express.Response) => 
    {
        try {
            const {firmId, workspaceName, type, privateSpaceName, username, startDate, endDate} = req.body;

            if (!firmId || !workspaceName || !type || !privateSpaceName || !username || !startDate || !endDate)
                return res.status(400).json({message: "Nisu prosleđeni svi potrebni podaci"});


            let reservationRecord = null;
            if (type == 'open')
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });
            else
                reservationRecord = await reservation.findOne({firmId: firmId, workspaceName: workspaceName, privateSpaceName: privateSpaceName, username: username, startDate: startDate, endDate: endDate, status: 'active' });

            if (!reservationRecord)
                return res.status(400).json({message: "Rezervacija nije pronadjena"});

            // 10 min window after start check
            const now = new Date();
            const resStart = new Date(reservationRecord.startDate!);

            const TEN_MIN = 10 * 60 * 1000;
            const diff = now.getTime() - resStart.getTime();

            if (diff < TEN_MIN)
                return res.status(400).json({message: "Rano je za odjavu rezervacije"});


            reservationRecord.status = 'declined';
            await reservationRecord.save();
            res.status(200).json({message: "Rezervacija je uspešno odjavljena"});
        } catch (err) {
            res.status(500).json("Došlo je do greške prilikom odjavljivanja rezervacije");
        }
    }
}

const reservationController = new ReservationController()
export default reservationController
