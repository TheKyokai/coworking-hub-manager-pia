import PrivateSpace from "./private-space"
import Rating from "./rating"

export default class Workspace
{
    // Workspace data
    // Unique (firmId, name)
    firmId = ""
    name = "" 

    pricePerHour = 0
    capacity = 0
    maximumViolations = 0

    description = ""
    
    // Coordinates
    lon = 0
    lat = 0
    city = ""
    address = ""

    status = "" // pending/approved
    privateSpaces: PrivateSpace[] = []
    
    

    comments: Comment[] = []
    ratings: Rating[] = []
}