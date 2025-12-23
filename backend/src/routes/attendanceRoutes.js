import express from "express";
import {
  getAttendance,
  markAttendance,
  exportAttendance
} from "../controllers/attendanceController.js";
import { logAdminAction } from "../middleware/logging.js";
import { checkAttendanceTime } from "../middleware/timeRestriction.js";

const router = express.Router();

// Attendance routes
router.get("/:batchName/attendance/:date/:session", logAdminAction("view_attendance", (req) => ({
  batchName: req.params.batchName,
  action: `View attendance for ${req.params.date} ${req.params.session}`,
  metadata: { date: req.params.date, session: req.params.session }
})), getAttendance);
router.post("/:batchName/attendance", checkAttendanceTime, logAdminAction("mark_attendance", (req) => ({
  batchName: req.params.batchName,
  action: `Mark attendance for ${req.body.date} ${req.body.session}`,
  metadata: { date: req.body.date, session: req.body.session, studentsCount: Object.keys(req.body.attendance || {}).length }
})), markAttendance);
router.get("/:batchName/export-attendance", logAdminAction("export_data", (req) => ({
  batchName: req.params.batchName,
  action: "Export attendance data"
})), exportAttendance);

export default router;