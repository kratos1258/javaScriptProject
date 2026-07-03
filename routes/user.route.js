const express = require("express");
const { signUP, signIn, verifyEmail, resendOtp, editProfile, uploadProfilePicture } = require("../controllers/user.controllers");
const isAuthentication = require("../utils/isAuthentication");
const upload = require("../config/multer");
const router = express.Router();


router.post("/signup", signUP);
router.post("/signin", signIn );
router.patch("/verify-email", verifyEmail)
router.post("/resend-otp", resendOtp);
router.patch("/edit-profile", isAuthentication, editProfile);
router.patch("/upload-profile-picture", isAuthentication, upload.single("profilePicture"), uploadProfilePicture);
module.exports = router;