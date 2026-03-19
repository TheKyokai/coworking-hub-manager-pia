export default class Reservation
{
    // Reservation data
    firmId = ""
    workspaceName = ""

    type = "" // open/private
    privateSpaceName = "" // in case of private

    username = ""

    status = "" // realized / missed
    
    startDate = new Date()
    endDate = new Date()
    reservationDate = new Date()
    
}