import express from "express";
import {
  studentLogin,
  getStudentData,
  changeStudentPassword,
  getLoginHistory,
  createStudentAuth,
  bulkCreateStudentAuth,
  updateStudentStatus,
  resetStudentPassword,
  getAllStudentAuth,
  deleteStudentAuth,
  updateStudentEmails
} from "../controllers/studentController.js";
import { authenticateSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", studentLogin);

// Student routes (require student to be logged in - you can add student auth middleware later)
router.get("/:regNo/data", getStudentData);
router.post("/:regNo/change-password", changeStudentPassword);
router.put("/:regNo/update-emails", updateStudentEmails);
router.get("/:regNo/login-history", getLoginHistory);

// Superadmin routes (require superadmin authentication)
router.post("/create", authenticateSuperAdmin, createStudentAuth);
router.post("/bulk-create", authenticateSuperAdmin, bulkCreateStudentAuth);
router.get("/all", authenticateSuperAdmin, getAllStudentAuth);
router.put("/:regNo/status", authenticateSuperAdmin, updateStudentStatus);
router.put("/:regNo/reset-password", authenticateSuperAdmin, resetStudentPassword);
router.delete("/:regNo", authenticateSuperAdmin, deleteStudentAuth);

export default router;
