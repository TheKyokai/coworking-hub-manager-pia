import mongoose from "mongoose"

const FirmSchema = new mongoose.Schema({
    firmId: String,
    taxId: String,
    name: String,
    city: String,
    address: String,
    managers: Array,
    status: String // pending/approved/rejected
})

export default mongoose.model('Firm', FirmSchema, "firms")