const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  role: String,
  score: Number,
  totalQuestions: Number,
  evaluations: Array,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", ResultSchema);