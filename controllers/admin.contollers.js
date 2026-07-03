const mongoose = require("mongoose")
const User = require("../models/user.model")



const makeAdmin = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(401).json({message: "Only an admin can perform this function"}) }
    const {userId} = req.params
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        user.role = "admin";
        await user.save();
        return res.status(201).json({message: "User role updated to admin", user});
    } catch (error) {
        console.error("Error updating role", error);
        return res.status(500).json({message:"Internal server error"});
        
    }
}

const getAllUsers = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(401).json({message: "Only an admin can perform this function"})
    }

    try {
        const users = await User.find().select("-password");
        return res.status(200).json({users});
    } catch (error) {
        console.error("Error getting users", error);
        return res.status(500).json({message: "Internal sever error"});
        
    }
}


module.exports = {
    makeAdmin,
    getAllUsers
}