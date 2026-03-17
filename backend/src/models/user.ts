import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    profilePicture: String,
    status: String, // pending/approved/rejected
    resetToken: String,
    role: String,
    firmId: String // Manager property
})

export default mongoose.model('User', UserSchema, "users")