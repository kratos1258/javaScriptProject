const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,},
    lastName: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required:true,
        unique: true},
    
    phoneNum: {type: String,
                required: true},
    password: {
        type: String,
        required: true
    },
    role : {
        type: String,
        enum: ["user", "admin"], 
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    profilePicture: {
        type: String,
    },
    bio: {
        type: String
    }
    
                
}, {timestamps:true, versionKey:false });


const User = mongoose.model("User", userSchema);

module.exports = User;

