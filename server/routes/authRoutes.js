const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // ✅ Import bcrypt
const User = require("../models/User");

console.log("authRoutes.js loaded");

// ✅ Test Route
router.get("/", (req, res) => {
  res.send("AUTH ROOT WORKING");
});

// ✅ Signup Route - with password hashing
router.post("/signup", async (req, res) => {
  console.log("🔥 Signup route hit");

  try {
    const { name, email, password } = req.body;

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists! Please login.",
      });
    }

    // ✅ Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ✅ Save user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // ✅ Storing hashed password
    });

    await newUser.save();

    res.status(201).json({
      message: "User Registered Successfully!",
    });
  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// ✅ Login Route - with password comparison
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found! Please signup first.",
      });
    }

    // ✅ Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid Password! Please try again.",
      });
    }

    res.status(200).json({
      message: "Login Successful!",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;