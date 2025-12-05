const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  result: {
    type: String,
    enum: ["focused", "unfocused"],
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
