import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import configuration and middleware
import connectDB from "./config/database.js";
import { apiLimiter } from "./middleware/auth.js";

// Import routes
import apiRoutes from "./routes/index.js";

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy - Required for rate limiting behind proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter middleware (200 requests per 15 minutes per IP)
app.use("/api/", apiLimiter);

// Connect to database
connectDB();

// API routes
app.use("/api", apiRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;