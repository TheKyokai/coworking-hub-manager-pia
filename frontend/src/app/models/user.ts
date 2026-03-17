export default class User
{
    // User data
    username = ""
    passwordHash = ""
    firstName = ""
    lastName = ""
    
    email = ""
    phoneNumber = ""
    profilePicture = ""

    status = "" // pending/approved/rejected
    
    // Password reset data
    resetToken = ""

    // User role and role data
    role = ""
    firmId = "" // Manager property
}