import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "progresspoint_default_secret";

// ─────────────────────────────────────────────
// Token generation
// ─────────────────────────────────────────────

/**
 * Generate a JWT token for any role.
 * @param {object} payload  - data to encode (role, id, name, etc.)
 * @param {string} expiresIn - e.g. "7d", "1d", "6h"
 */
export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Convenience generators
export const generateSuperAdminToken = () =>
  generateToken({ role: "superadmin" }, process.env.JWT_EXPIRES_IN || "7d");

export const generateAdminToken = (adminName, adminId) =>
  generateToken({ role: "admin", adminName, adminId }, process.env.JWT_EXPIRES_IN || "7d");

export const generateStudentToken = (regNo) =>
  generateToken({ role: "student", regNo }, process.env.JWT_STUDENT_EXPIRES_IN || "1d");

export const generateGuestToken = () =>
  generateToken({ role: "guest" }, process.env.JWT_GUEST_EXPIRES_IN || "6h");

// ─────────────────────────────────────────────
// Core verification middleware
// ─────────────────────────────────────────────

/**
 * Extracts and verifies a Bearer JWT from the Authorization header.
 * Attaches `req.user` on success.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again.", expired: true });
    }
    return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
  }
};

// ─────────────────────────────────────────────
// Role-based guard middlewares
// ─────────────────────────────────────────────

/** Only super admin can access */
export const requireSuperAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Super admin access required." });
    }
    next();
  },
];

/** Only regular admin (or super admin) can access */
export const requireAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    // Attach adminName from token for logging
    if (req.user.adminName) req.adminName = req.user.adminName;
    next();
  },
];

/** Super admin OR admin can access */
export const requireAdminOrSuperAdmin = [
  verifyToken,
  (req, res, next) => {
    const { role } = req.user;
    if (role !== "admin" && role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Admin or Super admin access required." });
    }
    if (req.user.adminName) req.adminName = req.user.adminName;
    req.isSuperAdmin = role === "superadmin";
    next();
  },
];

/** Only authenticated students can access */
export const requireStudent = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Student access required." });
    }
    req.studentRegNo = req.user.regNo;
    next();
  },
];

/** Any authenticated user (all roles including guest) can access */
export const requireAuth = [
  verifyToken,
  (req, res, next) => {
    next();
  },
];
