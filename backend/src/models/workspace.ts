import mongoose from "mongoose"

const WorkspaceSchema = new mongoose.Schema({
    // Unique (firmId, name)
    firmId: String,
    name: String,
    pricePerHour: Number,
    capacity: Number,
    status: String,
    privateSpaces: Array
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