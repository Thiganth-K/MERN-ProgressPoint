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

const router = express.Router();

// Get all departments
router.get("/", getAllDepartments);

// Get department statistics
router.get("/stats", getDepartmentStats);

// Get department averages for charts
router.get("/averages", getDepartmentAverages);

// Get students from a specific department
router.get("/:department/students", getDepartmentStudents);

// Get attendance for a department by date and session
router.get("/:department/attendance", getDepartmentAttendance);

// Export department students as Excel
router.get("/:department/export", exportDepartmentStudents);

// Search student by registration number
router.get("/search/:regNo", searchStudentByRegNo);

export default router;
