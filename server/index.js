
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import profileRoutes from "./routes/profile.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import socialRoutes from "./routes/social.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing JWT_SECRET or MONGO_URI.");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static media uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// API welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to EchoLog API",
    status: "running",
    frontend: "http://localhost:5173"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "error",
    service: "echolog-api",
    database: connected ? "connected" : "disconnected",
    dbName: connected ? mongoose.connection.name : null
  });
});

// Authentication rate limit
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", socialRoutes);
app.use("/api/profile", profileRoutes);
// Error handling (keep these last)
app.use(notFound);
app.use(errorHandler);

// Connect database and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("EchoLog backend started");
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log("MongoDB: Connected");
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
