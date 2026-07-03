const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");
const dbConnection = require("./config/db");
const userRoute = require("./routes/user.route")
const adminRoute = require("./routes/admin.route")
const walletRoute = require("./routes/wallet.route");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT;

app.get("/", (req,res) => {
    res.send("Welcome to our home page");
});

// user routes
app.use("/api/users", userRoute);
// admin routes
app.use("/api/admin", adminRoute);
// wallet routes
app.use("/api/wallet", walletRoute);

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
    dbConnection();
})