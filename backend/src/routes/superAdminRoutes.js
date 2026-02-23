import express from "express";
import {
  getAllLogs,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  moveStudent,
  clearLogs,
  getStudentByRegNo,
  updateStudent,
  deleteStudent,
  addStudent
} from "../controllers/superAdminController.js";
import { requireSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// All super admin routes require superadmin JWT
router.get("/logs", requireSuperAdmin, getAllLogs);
router.delete("/logs", requireSuperAdmin, clearLogs);
router.get("/admins", requireSuperAdmin, getAdmins);
router.post("/admins", requireSuperAdmin, createAdmin);
router.put("/admins/:id", requireSuperAdmin, updateAdmin);
router.delete("/admins/:id", requireSuperAdmin, deleteAdmin);
router.post("/move-student", requireSuperAdmin, moveStudent);

// Student management routes (superadmin only)
router.get("/student/:regNo", requireSuperAdmin, getStudentByRegNo);
router.put("/student/:batchName/:regNo", requireSuperAdmin, updateStudent);
router.delete("/student/:batchName/:regNo", requireSuperAdmin, deleteStudent);
router.post("/student/:batchName", requireSuperAdmin, addStudent);

export default router;