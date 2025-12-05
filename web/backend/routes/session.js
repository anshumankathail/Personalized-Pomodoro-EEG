// routes/session.js
const express = require("express");
const router = express.Router();
const fetch = require("../middleware/fetchdetails");
const Session = require("../models/Session");

// POST /api/session/add
router.post("/add", fetch, async (req, res) => {
  try {
    const { result, duration } = req.body;

    if (!["focused", "unfocused"].includes(result)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid result type" });
    }

    const session = new Session({
      userId: req.user.id,
      result,
      duration, // in seconds
    });

    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/session/all
router.get("/all", fetch, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({
      timestamp: -1,
    });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
});
router.get("/last5", fetch, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({ success: true, sessions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ✅ ADD THIS LINE TO FIX THE ERROR
// ✅ AT THE BOTTOM OF routes/session.js
module.exports = router;
