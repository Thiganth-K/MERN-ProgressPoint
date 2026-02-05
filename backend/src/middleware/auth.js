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

// Middleware to authenticate super admin
export const authenticateSuperAdmin = (req, res, next) => {
  const { username, password } = req.body;
  
  // Check if credentials are provided in body (for POST requests)
  if (username && password) {
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      return next();
    }
  }
  
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [username, password] = Buffer.from(authHeader.split(' ')[1] || '', 'base64')
      .toString()
      .split(':');
    
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      return next();
    }
  }
  
  return res.status(401).json({ message: "Unauthorized. Super admin access required." });
};