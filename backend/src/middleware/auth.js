import rateLimit from "express-rate-limit";

// Rate limiter middleware (100 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Super admin configuration
export const SUPER_ADMIN = {
  username: process.env.SUPER_ADMIN_USERNAME,
  password: process.env.SUPER_ADMIN_PASSWORD
};