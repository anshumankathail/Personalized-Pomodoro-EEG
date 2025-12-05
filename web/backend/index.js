const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
const connectToMongo = require("./db"); // MongoDB connection

// ✅ Connect to MongoDB
connectToMongo();

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json()); // IMPORTANT: Use this before routes!

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Make sure this comes AFTER express.json
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/session", require("./routes/session")); // ✅ Only if file is session.js

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
