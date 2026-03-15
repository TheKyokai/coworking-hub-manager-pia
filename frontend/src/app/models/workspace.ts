import PrivateSpace from "./private-space"

export default class Workspace
{
    // Workspace data
    // Unique (firmId, name)
    firmId = ""
    name = "" 

    pricePerHour = 0
    capacity = 0

    status = "" // pending/approved/rejected
    privateSpaces: PrivateSpace[] = []
}