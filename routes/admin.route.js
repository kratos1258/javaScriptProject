const express = require("express");
const { makeAdmin, getAllUsers } = require("../controllers/admin.contollers");
const isAuthentication = require("../utils/isAuthentication");
const router = express.Router();


router.patch("/admin-role/:userId", isAuthentication, makeAdmin);
router.get("/users",isAuthentication, getAllUsers);


module.exports = router;