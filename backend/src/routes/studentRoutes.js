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

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", studentLogin);

// Student routes (require student to be logged in - you can add student auth middleware later)
router.get("/:regNo/data", getStudentData);
router.post("/:regNo/change-password", changeStudentPassword);
router.put("/:regNo/update-emails", updateStudentEmails);
router.get("/:regNo/login-history", getLoginHistory);

// Superadmin routes - Student Auth Management
router.post("/create", createStudentAuth);
router.post("/bulk-create", bulkCreateStudentAuth);
router.get("/all", getAllStudentAuth);
router.put("/:regNo/status", updateStudentStatus);
router.put("/:regNo/reset-password", resetStudentPassword);
router.delete("/:regNo", deleteStudentAuth);

// Superadmin routes - Student CRUD in Batches
router.get("/batch/all-students", getAllStudentsFromBatches);
router.post("/batch/create-student", createStudentInBatch);
router.put("/batch/:studentId", updateStudentInBatch);
router.delete("/batch/:studentId", deleteStudentFromBatch);

export default router;
