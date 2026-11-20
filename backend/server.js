const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env
dotenv.config();

// 🔍 Debug: check if URI is loading correctly
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));

// Server
app.listen(5000, () => console.log("Server running on port 5000"));