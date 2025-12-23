import express from "express";
import {
  updateStudentMarks,
  getMarksForDate,
  saveMarksForDate
} from "../controllers/marksController.js";
import { logAdminAction } from "../middleware/logging.js";
import { checkMarksTime } from "../middleware/timeRestriction.js";

const router = express.Router();

// Marks routes
router.post("/:batchName/student/:regNo/marks", checkMarksTime, logAdminAction("update_marks", (req) => ({
  batchName: req.params.batchName,
  studentRegNo: req.params.regNo,
  action: "Update student marks",
  metadata: { marks: req.body.marks }
})), updateStudentMarks);
router.get("/:batchName/marks/:date", logAdminAction("view_marks", (req) => ({
  batchName: req.params.batchName,
  action: `View marks for date ${req.params.date}`,
  metadata: { date: req.params.date }
})), getMarksForDate);
router.post("/:batchName/marks", checkMarksTime, logAdminAction("update_marks", (req) => ({
  batchName: req.params.batchName,
  action: `Update batch marks for date ${req.body.date}`,
  metadata: { date: req.body.date, studentsCount: Object.keys(req.body.marks || {}).length }
})), saveMarksForDate);

export default router;