const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// Create an instance of Express application
const app = express();

// Listen on the correct port
const port = process.env.PORT; // this is our port for Development. For Production we are going to use for example: port 80 for AWS

// Customize server
app.use(express.json());

// Register User and Task Routers
app.use(userRouter);
app.use(taskRouter);

// Start our server
app.listen(port, () => {
  console.log(`Server running on port ${port} http://localhost:3000/`);
});
