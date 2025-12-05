// db.js
const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://anshuman4:anshuman4@intervals.r68km19.mongodb.net/Pomodoro_Int?retryWrites=true&w=majority&appName=Intervals";
// const mongoURI='mongodb://localhost:27017'
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

module.exports = connectToMongo;
