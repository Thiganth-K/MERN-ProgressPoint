import express from "express";
import {
  getAllBatches,
  createBatch,
  addStudentsToBatch,
  getBatchStudents,
  removeStudentFromBatch,
  deleteBatch,
  updateBatch,
  exportStudents,
  getBatchAverages,
  searchStudentByRegNo
} from "../controllers/batchController.js";
import { logAdminAction } from "../middleware/logging.js";
import { requireAdminOrSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// Batch management routes
router.get("/", requireAdminOrSuperAdmin, getAllBatches);
router.post("/", requireAdminOrSuperAdmin, createBatch);
router.get("/averages", requireAdminOrSuperAdmin, getBatchAverages);
router.get("/search/:regNo", requireAdminOrSuperAdmin, logAdminAction("search_student", (req) => ({
  studentRegNo: req.params.regNo,
  action: "Search student by registration number"
})), searchStudentByRegNo);
router.post("/:batchName/students", requireAdminOrSuperAdmin, addStudentsToBatch);
router.get("/:batchName/students", requireAdminOrSuperAdmin, logAdminAction("view_batch_students", (req) => ({
  batchName: req.params.batchName,
  action: "View batch students"
})), getBatchStudents);
router.delete("/:batchName/student/:regNo", requireAdminOrSuperAdmin, removeStudentFromBatch);
router.put("/:batchName", requireAdminOrSuperAdmin, logAdminAction("update_batch", (req) => ({
  batchName: req.params.batchName,
  newBatchName: req.body.newBatchName,
  newYear: req.body.newYear,
  action: "Update batch name and year"
})), updateBatch);
router.delete("/:batchName", requireAdminOrSuperAdmin, deleteBatch);
router.get("/:batchName/export", requireAdminOrSuperAdmin, logAdminAction("export_data", (req) => ({
  batchName: req.params.batchName,
  action: "Export batch students data"
})), exportStudents);

export default router;