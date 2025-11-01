const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: false,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

// Environment variable validation
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error("❌ ERROR: Missing MONGO_URI in environment variables");
  console.error("   Please set MONGO_URI in your .env file");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ ERROR: Missing JWT_SECRET in environment variables");
  console.error("   Please set JWT_SECRET in your .env file");
  console.error("   Generate one using: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
  process.exit(1);
}

// DB Connection and Server start

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });


