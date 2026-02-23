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
  updateStudentEmails,
  getAllStudentsFromBatches,
  createStudentInBatch,
  updateStudentInBatch,
  deleteStudentFromBatch
} from "../controllers/studentController.js";
import { requireStudent, requireSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// ── Public (no auth required) ────────────────────
router.post("/login", studentLogin);

// ── Student routes (require student JWT) ────────
router.get("/:regNo/data", requireStudent, getStudentData);
router.post("/:regNo/change-password", requireStudent, changeStudentPassword);
router.put("/:regNo/update-emails", requireStudent, updateStudentEmails);
router.get("/:regNo/login-history", requireStudent, getLoginHistory);

// ── Super admin routes (student auth management) ────────
router.post("/create", requireSuperAdmin, createStudentAuth);
router.post("/bulk-create", requireSuperAdmin, bulkCreateStudentAuth);
router.get("/all", requireSuperAdmin, getAllStudentAuth);
router.put("/:regNo/status", requireSuperAdmin, updateStudentStatus);
router.put("/:regNo/reset-password", requireSuperAdmin, resetStudentPassword);
router.delete("/:regNo", requireSuperAdmin, deleteStudentAuth);

// ── Super admin routes (student CRUD in batches) ────────
router.get("/batch/all-students", requireSuperAdmin, getAllStudentsFromBatches);
router.post("/batch/create-student", requireSuperAdmin, createStudentInBatch);
router.put("/batch/:studentId", requireSuperAdmin, updateStudentInBatch);
router.delete("/batch/:studentId", requireSuperAdmin, deleteStudentFromBatch);

export default router;
