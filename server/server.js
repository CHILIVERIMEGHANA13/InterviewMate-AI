const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

console.log("SERVER FILE:", __filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("InterviewMate AI Backend Running");
});
app.get("/check", (req, res) => {
  res.send("CHECK ROUTE WORKING");
});
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});