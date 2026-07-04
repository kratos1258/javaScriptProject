const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");
const { deleteFromCloudinary, uploadToCloudinary } = require("../utils/cloudinary");


const signUP = async (req, res) => {
    const {firstName, lastName, email, phoneNum, password} = req.body;
    try {
        if (!firstName || !lastName || !email || !phoneNum || !password) {
        return res.send(400).json({message: "All fields are required"})}
    const user = await User.findOne({ email });
    if (user) {
        return res.status(404).json({message: "User Already Exits"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); //generate 6 digit otp
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //otp valid in 10mins


    const newUser = await User.create({firstName, lastName, email, phoneNum, password: hashedPassword, otp, otpExpiry});

    
    await sendEmail(email, "VERIFICATION CODE", `Your email verification code is ${otp} expires in 10 mins`)

    const userResponse = {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNum: newUser.phoneNum,
        otp: newUser.otp
    }
    return res.status(201).json({message: "User created successfully", user: userResponse}); 
    
    } catch (error) {
        console.error("Error creating User");
        return res.status(500).json({message: error.message});
        
    }


}

const signIn = async (req,res) => {
    const {email, password} = req.body;
    try {
        if (!email || !password ) {
            return res.status(400).json({message:"All fields are required"});
        }
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "Invalid email and password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({message: "Invalid email and password"});

        }
        if (!user.isVerified) {
            return res.status(400).json({message: "Please verify your mail before signing it"})
        }
        const token = jwt.sign({id: user._id, firstName: user.firstName}, process.env.JWT_SECRET,{expiresIn: "1hr"});
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNum: user.phoneNum,
            token: token
    
        }

        return res.status(200).json({message: "user signned in successfully", userResponse})
    } catch (error) {
        console.error("User unable to signin")
        return res.status(500).json({message: "Internal server error"});
    }

}

const verifyEmail = async (req,res) => {
    const {otp} = req.body;
    try {
        const user = await User.findOne({otp});
        if (!user) {
            return res.status(404).json({message: "Invalid user"});
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({message: "OTP Expired"});
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        return res.status(200).json({message: "Email verified successfully"});
}   catch(error) {
    console.log(error);
    return res.status(500).json({message: "Internal server error"});
}


}

const resendOtp = async (req,res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) { 
            return res.status(400).json({message: " Invalid User"});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpiry = otpExpiry;

        await user.save();
        return res.status(200).json({message: "OTP resent successfully ", otp})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

const editProfile = async (req,res) => {
    const { id } = req.user;
    const {firstName, lastName, bio} = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({message: "User not found"});

        }
        
        //Update profile fields
        if(firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (bio) user.bio = bio;

        await user.save();

        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
        };
        return res.status(200).json({message: "Profile updated successfully", user: userResponse});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal server error"});
    };
}

const uploadProfilePicture = async (req, res) => {
  const { id } = req.user;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profilePicture) {
      const publicId = user.profilePicture.split("/").pop().split(".")[0];
      await deleteFromCloudinary(`demo/${publicId}`);
    }

    const fileName = `${id}-${Date.now()}`;
    const uploadResult = await uploadToCloudinary(req.file.buffer, fileName);
    user.profilePicture = uploadResult.secure_url;

    await user.save();
    return res.status(200).json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    signUP,
    signIn,
    verifyEmail,
    resendOtp,
    editProfile,
    uploadProfilePicture,
}