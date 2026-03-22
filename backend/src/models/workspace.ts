import { Double } from "mongodb"
import mongoose from "mongoose"

const WorkspaceSchema = new mongoose.Schema({
    // Unique (firmId, name)
    firmId: String,
    name: String,
    pricePerHour: Double,
    capacity: Number,
    city: String,
    address: String,
    lat: Double,
    lon: Double,
    maximumViolations: Number,
    status: String,
    privateSpaces: Array,
    description: String,
    comments: Array,
    ratings: Array,
    pictures: Array,
    approvalDate: Date
})

export default mongoose.model('Workspace', WorkspaceSchema, "workspaces")
