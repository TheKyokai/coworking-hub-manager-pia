import mongoose from "mongoose"

const WorkspaceSchema = new mongoose.Schema({
    // Unique (firmId, name)
    firmId: String,
    name: String,
    pricePerHour: Number,
    capacity: Number,
    city: String,
    address: String,
    maximumViolations: Number,
    status: String,
    privateSpaces: Array,
    description: String,
    comments: Array,
    ratings: Array,
    pictures: Array
})

export default mongoose.model('Workspace', WorkspaceSchema, "workspaces")

// export default class PrivateSpace
// {

//     // Private space data

//     // Unique (firmId, workspaceName, spaceName)
//     firmId = "" 
//     workspaceName = ""
//     spaceName = "" 
    
//     status = "" // pending/approved/rejected

//     type = "" // office/conference
//     capacity = 0 // predefined for conference 10-12
    
// }