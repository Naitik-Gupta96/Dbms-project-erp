const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");
const adminRouter = require('./route/admin');
const studentRouter = require('./route/student');
const profRouter = require('./route/prof');

dotenv.config();

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5500";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it in backend .env");
  }
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
}

function mountRoutes() {
  app.use("/admin", adminRouter);
  app.use("/student", studentRouter);
  app.use("/prof", profRouter);
}

mountRoutes();

app.get("/", (req, res) => {
  res.send("Academic Portal API is running");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  connectDB
};
