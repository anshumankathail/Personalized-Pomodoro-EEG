const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetch = require("../middleware/fetchdetails");
const User = require("../models/User");

const jwtSecret = "HaHa"; // Replace with env variable in production

// ✅ Route 1: Create a new user
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    body("name").isLength({ min: 3 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ success, error: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const securePass = await bcrypt.hash(req.body.password, salt);

      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePass,
        preferences: {
          notifications: true,
          soundEffects: true,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          shortBreakDuration: 5,
          longBreakDuration: 10,
          focusDuration: 25, // ✅ Add this line
        },
      });

      const data = { user: { id: newUser.id } };
      const authToken = jwt.sign(data, jwtSecret);
      success = true;

      res.json({
        success,
        authToken,
        user: {
          _id: newUser._id,
          name: newUser.name,
          preferences: newUser.preferences,
        },
      });
    } catch (error) {
      console.error("Error in /createuser:", error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// ✅ Route 2: Authenticate a user (Login)
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const data = { user: { id: user.id } };
      const authToken = jwt.sign(data, jwtSecret);
      success = true;

      res.json({
        success,
        authToken,
        user: {
          _id: user._id,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } catch (error) {
      console.error("Error in /login:", error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// ✅ Route 3: Get logged-in user info (requires token)
router.post("/getuser", fetch, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (error) {
    console.error("Error in /getuser:", error.message);
    res.status(500).send("Server Error");
  }
});

// ✅ Route 4: Update user profile & preferences
// ✅ Route 4: Update user profile & preferences
router.put("/updateuser", fetch, async (req, res) => {
  const userId = req.user.id;
  const { name, email, preferences } = req.body;

  try {
    const updateFields = {
      name,
      email,
      "preferences.notifications": preferences.notifications,
      "preferences.soundEffects": preferences.soundEffects,
      "preferences.autoStartBreaks": preferences.autoStartBreaks,
      "preferences.autoStartPomodoros": preferences.autoStartPomodoros,
      "preferences.shortBreakDuration": preferences.shortBreakDuration,
      "preferences.longBreakDuration": preferences.longBreakDuration,
      "preferences.focusDuration": preferences.focusDuration,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
