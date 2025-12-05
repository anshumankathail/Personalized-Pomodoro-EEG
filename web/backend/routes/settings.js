// routes/settings.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET user preferences
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT to update preferences (optional)
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { preferences: req.body },
      { new: true }
    );
    res.json(updatedUser.preferences);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
