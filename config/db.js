const mongoose = require("mongoose");
require("dotenv").config();


const dburl = process.env.MONGODB_URL;

const dbConnection = async () => {
    try {
        await mongoose.connect(dburl);
        console.log("connected to Mongodb database");
        
    } catch (error) {
        console.error("Error connecting to Mongodb", error)
        process.exit(1);
        
    }
    
}


module.exports = dbConnection;