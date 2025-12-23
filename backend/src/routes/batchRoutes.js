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

const router = express.Router();

// Batch management routes
router.get("/", getAllBatches);
router.post("/", createBatch);
router.get("/averages", getBatchAverages);
router.get("/search/:regNo", logAdminAction("search_student", (req) => ({
  studentRegNo: req.params.regNo,
  action: "Search student by registration number"
})), searchStudentByRegNo);
router.post("/:batchName/students", addStudentsToBatch);
router.get("/:batchName/students", logAdminAction("view_batch_students", (req) => ({
  batchName: req.params.batchName,
  action: "View batch students"
})), getBatchStudents);
router.delete("/:batchName/student/:regNo", removeStudentFromBatch);
router.put("/:batchName", logAdminAction("update_batch", (req) => ({
  batchName: req.params.batchName,
  newBatchName: req.body.newBatchName,
  newYear: req.body.newYear,
  action: "Update batch name and year"
})), updateBatch);
router.delete("/:batchName", deleteBatch);
router.get("/:batchName/export", logAdminAction("export_data", (req) => ({
  batchName: req.params.batchName,
  action: "Export batch students data"
})), exportStudents);

export default router;