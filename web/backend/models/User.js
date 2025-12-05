const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    autoStartBreaks: { type: Boolean, default: false },
    autoStartPomodoros: { type: Boolean, default: false },
    shortBreakDuration: { type: Number, default: 5 },
    longBreakDuration: { type: Number, default: 10 },
    focusDuration: { type: Number, default: 25 }, // ✅ ADD THIS
  },
});

module.exports = mongoose.model("user", UserSchema, "users"); // Explicitly specify 'users'
