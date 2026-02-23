import express from "express";
import { login, logout, getAllAdmins, logAction } from "../controllers/adminController.js";
import { requireAdmin, requireSuperAdmin, generateGuestToken } from "../middleware/jwtAuth.js";

const router = express.Router();

// ── Public ────────────────────────────────────
// Admin / super admin login (returns JWT)
router.post("/login", login);

// Guest token — any visitor can get a time-limited guest JWT
router.post("/guest-token", (req, res) => {
  const token = generateGuestToken();
  res.json({ success: true, role: "guest", token });
});

// ── Protected (admin or superadmin) ──────────
router.post("/logout", requireAdmin, logout);
router.post("/log-action", requireAdmin, logAction);

// Get all admins — superadmin only
router.get("/", requireSuperAdmin, getAllAdmins);

export default router;