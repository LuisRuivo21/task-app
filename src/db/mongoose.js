const mongoose = require("mongoose");

// Connect Mongoose to database
const connectionURL = process.env.MONGODB_URL;

mongoose.connect(connectionURL);
