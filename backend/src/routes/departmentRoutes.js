import express from "express";
import {
  getAllDepartments,
  getDepartmentStudents,
  getDepartmentStats,
  exportDepartmentStudents,
  searchStudentByRegNo,
  getDepartmentAverages,
  getDepartmentAttendance
} from "../controllers/departmentController.js";
import { requireAdminOrSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// All department routes require admin or superadmin JWT
router.get("/", requireAdminOrSuperAdmin, getAllDepartments);
router.get("/stats", requireAdminOrSuperAdmin, getDepartmentStats);
router.get("/averages", requireAdminOrSuperAdmin, getDepartmentAverages);
router.get("/:department/students", requireAdminOrSuperAdmin, getDepartmentStudents);
router.get("/:department/attendance", requireAdminOrSuperAdmin, getDepartmentAttendance);
router.get("/:department/export", requireAdminOrSuperAdmin, exportDepartmentStudents);
router.get("/search/:regNo", requireAdminOrSuperAdmin, searchStudentByRegNo);

export default router;
