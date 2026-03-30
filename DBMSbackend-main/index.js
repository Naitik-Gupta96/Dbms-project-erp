const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");
const adminRouter = require('./route/admin');
const studentRouter = require('./route/student');
const profRouter = require('./route/prof');

dotenv.config();

const app = express();
app.use(cors());



console.log("hello");
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected"))
  .catch(err => console.log("Error:", err));

app.use(bodyParser.json());

app.use("/admin", adminRouter);
app.use("/student", studentRouter);
app.use("/prof", profRouter);

app.get("/", (req, res) => {
  res.send("Academic Portal API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
