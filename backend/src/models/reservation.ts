import mongoose from "mongoose"

const ReservationSchema = new mongoose.Schema({
    firmId: String,
    workspaceName: String,
    type: String, // open/private
    privateSpaceName: String, // in case of private
    username: String,
    status: String, // active / cancelled / confirmed / declined
    startDate: Date,
    endDate: Date,
    reservationDate: Date
})

export default mongoose.model('Reservation', ReservationSchema, "reservations")