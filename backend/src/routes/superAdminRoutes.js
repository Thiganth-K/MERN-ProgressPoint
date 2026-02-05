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

const router = express.Router();

// Super admin routes
router.get("/logs", getAllLogs);
router.delete("/logs", clearLogs);
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);
router.post("/move-student", moveStudent);

// Student management routes
router.get("/student/:regNo", getStudentByRegNo);
router.put("/student/:batchName/:regNo", updateStudent);
router.delete("/student/:batchName/:regNo", deleteStudent);
router.post("/student/:batchName", addStudent);

export default router;