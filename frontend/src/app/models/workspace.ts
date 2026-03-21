import PrivateSpace from "./private-space"
import Rating from "./rating"
import Comment from "./comment"

export default class Workspace
{
    // Workspace data
    // Unique (firmId, name)
    firmId = ""
    name = "" 

    pricePerHour = 0.0
    capacity = 0
    maximumViolations = 0

    description = ""
    
    // Coordinates
    lon = 0.0
    lat = 0.0
    city = ""
    address = ""

    status = "" // pending/approved
    privateSpaces: PrivateSpace[] = []
    
    comments: Comment[] = []
    ratings: Rating[] = []
}