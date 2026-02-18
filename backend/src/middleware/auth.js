import rateLimit from "express-rate-limit";

// Rate limiter middleware (200 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
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

// Alias for super admin authentication 
export const superAdminAuth = authenticateSuperAdmin;

// Middleware to authenticate admin users
export const adminAuth = (req, res, next) => {
  const adminName = req.headers['x-admin-name'];
  
  if (!adminName) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized. Admin authentication required." 
    });
  }
  
  // Store adminName in request for use in controllers
  req.adminName = adminName;
  next();
};

// Middleware to authenticate either admin or super admin
export const adminOrSuperAdminAuth = (req, res, next) => {
  // First check if it's a super admin
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [username, password] = Buffer.from(authHeader.split(' ')[1] || '', 'base64')
      .toString()
      .split(':');
    
    if (username === SUPER_ADMIN.username && password === SUPER_ADMIN.password) {
      req.isSuperAdmin = true;
      return next();
    }
  }
  
  // Otherwise check if it's a regular admin
  const adminName = req.headers['x-admin-name'];
  if (adminName) {
    req.adminName = adminName;
    req.isSuperAdmin = false;
    return next();
  }
  
  return res.status(401).json({ 
    success: false,
    message: "Unauthorized. Admin or Super Admin access required." 
  });
};

// Middleware to authenticate students
// Students authenticate via session/token stored in localStorage
export const studentAuth = (req, res, next) => {
  // In a real application, you'd verify a JWT token or session
  // For now, we'll assume the student regNo is validated on the frontend
  // and passed as a parameter or in headers
  
  const studentRegNo = req.params.regNo || req.body.studentRegNo || req.headers['x-student-regno'];
  
  if (!studentRegNo) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized. Student authentication required." 
    });
  }
  
  // Store regNo in request for use in controllers
  req.studentRegNo = studentRegNo;
  next();
};