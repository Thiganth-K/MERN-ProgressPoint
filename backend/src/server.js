import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Admin from "./admin.model.js";
import Batch from "./batch.model.js";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import rateLimit from "express-rate-limit";
import PlacementDoneStudent from "./placementDone.model.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiter middleware (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", apiLimiter);

const SUPER_ADMIN = {
  username: process.env.SUPER_ADMIN_USERNAME,
  password: process.env.SUPER_ADMIN_PASSWORD
};

mongoose.connect(process.env.MONGO_URI);

// Admin login (with logs)
app.post("/api/admin/login", async (req, res) => {
  const { adminName, adminPassword } = req.body;
  if (adminName === SUPER_ADMIN.username && adminPassword === SUPER_ADMIN.password) {
    return res.json({ success: true, role: "superadmin" });
  }
  try {
    const admin = await Admin.findOne({ adminName, adminPassword });
    if (!admin) return res.status(401).json({ success: false, error: "Invalid credentials" });
    admin.logs.push({ type: "login", timestamp: new Date() });
    await admin.save();
    res.json({ success: true, role: "admin" });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Admin logout (with logs)
app.post("/api/admin/logout", async (req, res) => {
  const { adminName } = req.body;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    admin.logs.push({ type: "logout", timestamp: new Date() });
    await admin.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Superadmin: get all admin logs
app.get("/api/superadmin/logs", async (req, res) => {
  try {
    const admins = await Admin.find({}, "adminName logs");
    res.json({ logs: admins.map(a => ({ adminName: a.adminName, logs: a.logs })) });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Superadmin: manage admins
app.get("/api/superadmin/admins", async (req, res) => {
  const admins = await Admin.find({}, "adminName adminPassword"); // include _id by default
  res.json({ admins });
});
app.post("/api/superadmin/admins", async (req, res) => {
  const { adminName, adminPassword } = req.body;
  try {
    const admin = new Admin({ adminName, adminPassword, logs: [] });
    await admin.save();
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update admin name and password by ID
app.put("/api/superadmin/admins/:id", async (req, res) => {
  const { id } = req.params;
  const { adminName, adminPassword } = req.body;
  try {
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ success: false, error: "Admin not found" });
    admin.adminName = adminName;
    admin.adminPassword = adminPassword;
    await admin.save();
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.delete("/api/superadmin/admins/:id", async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Superadmin: move student between batches
app.post("/api/superadmin/move-student", async (req, res) => {
  const { fromBatch, toBatch, regNo } = req.body;
  try {
    const from = await Batch.findOne({ batchName: fromBatch });
    const to = await Batch.findOne({ batchName: toBatch });
    if (!from || !to) return res.status(404).json({ error: "Batch not found" });
    const idx = from.students.findIndex(s => s.regNo === regNo);
    if (idx === -1) return res.status(404).json({ error: "Student not found" });
    const [student] = from.students.splice(idx, 1);
    to.students.push(student);
    await from.save();
    await to.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Batches CRUD
app.get("/api/batches", async (req, res) => {
  const batches = await Batch.find();
  res.json({ batches });
});
app.post("/api/batches", async (req, res) => {
  const { batchName, students } = req.body;
  try {
    const batch = new Batch({
      batchName,
      students: (students || []).map(s => ({
        ...s,
        marks: { efforts: 0, presentation: 0, assessment: 0, assignment: 0 },
        marksLastUpdated: null,
        attendance: [],
        attendancePercent: 0
      }))
    });
    await batch.save();
    res.json({ success: true, batch });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ success: false, error: "Batch name already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/batches/:batchName/students", async (req, res) => {
  const { batchName } = req.params;
  const { students } = req.body;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  students.forEach(s => {
    batch.students.push({
      ...s,
      marks: { efforts: 0, presentation: 0, assessment: 0, assignment: 0 },
      marksLastUpdated: null,
      attendance: [],
      attendancePercent: 0
    });
  });
  await batch.save();
  res.json({ success: true, batch });
});

// Get students of a batch
app.get("/api/batches/:batchName/students", async (req, res) => {
  const { batchName } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  res.json({ students: batch.students });
});

// Update marks for a student in a batch
app.post("/api/batches/:batchName/student/:regNo/marks", async (req, res) => {
  const { batchName, regNo } = req.params;
  const { marks } = req.body;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  const student = batch.students.find(s => s.regNo === regNo);
  if (!student) return res.status(404).json({ error: "Student not found" });
  student.marks = marks;
  student.marksLastUpdated = new Date();
  await batch.save();
  res.json({ success: true });
});

// Get existing attendance for a batch on a specific date and session
app.get("/api/batches/:batchName/attendance/:date/:session", async (req, res) => {
  const { batchName, date, session } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  
  const existingAttendance = {};
  batch.students.forEach(student => {
    const attendanceRecord = (student.attendance || []).find(
      a => a.date === date && a.session === session
    );
    if (attendanceRecord) {
      existingAttendance[student.regNo] = attendanceRecord.status;
    }
  });
  
  res.json({ attendance: existingAttendance });
});

// Mark attendance for a batch
app.post("/api/batches/:batchName/attendance", async (req, res) => {
  const { batchName } = req.params;
  const { date, session, attendance } = req.body; // session added
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  batch.students.forEach(student => {
    if (attendance[student.regNo]) {
      // Remove any existing attendance for this date and session
      student.attendance = (student.attendance || []).filter(
        a => !(a.date === date && a.session === session)
      );
      // Add the new attendance record
      student.attendance.push({ date, session, status: attendance[student.regNo] });
      // Recalculate attendance percent (per session)
      const totalSessions = student.attendance.length;
      const presentSessions = student.attendance.filter(a => a.status === 'Present' || a.status === 'On-Duty').length;
      student.attendancePercent = totalSessions > 0 ? ((presentSessions / totalSessions) * 100).toFixed(2) : 0;
    }
  });
  await batch.save();
  res.json({ success: true });
});

// Superadmin: remove a batch
app.delete("/api/batches/:batchName", async (req, res) => {
  const { batchName } = req.params;
  try {
    await Batch.deleteOne({ batchName });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all admins (without passwords)
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, '-adminPassword'); // don't send passwords
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.delete('/api/superadmin/logs', async (req, res) => {
  try {
    await Admin.updateMany({}, { $set: { logs: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remove a student from a batch
app.delete("/api/batches/:batchName/student/:regNo", async (req, res) => {
  const { batchName, regNo } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  const initialLength = batch.students.length;
  batch.students = batch.students.filter(s => s.regNo !== regNo);
  if (batch.students.length === initialLength) {
    return res.status(404).json({ error: "Student not found in batch" });
  }
  await batch.save();
  res.json({ success: true });
});

// Export students of a batch as Excel
app.get("/api/batches/:batchName/export", async (req, res) => {
  const { batchName } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  // Add header row
  worksheet.addRow([
    "Reg No",
    "Name",
    "Efforts",
    "Presentation",
    "Assessment",
    "Assignment",
    "Attendance (%)"
  ]);

  // Add student rows
  batch.students.forEach(s => {
    worksheet.addRow([
      s.regNo,
      s.name,
      s.marks?.efforts ?? 0,
      s.marks?.presentation ?? 0,
      s.marks?.assessment ?? 0,
      s.marks?.assignment ?? 0,
      s.attendancePercent ?? 0
    ]);
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${batchName}_students.xlsx`
  );

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
});

// Export attendance of a batch as Excel
app.get("/api/batches/:batchName/export-attendance", async (req, res) => {
  const { batchName } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  // Collect all unique (date, session) pairs
  const allDateSessionsSet = new Set();
  batch.students.forEach(student => {
    (student.attendance || []).forEach(record => {
      allDateSessionsSet.add(`${record.date}__${record.session}`);
    });
  });
  // Sort by date then session (FN before AN)
  const allDateSessions = Array.from(allDateSessionsSet).sort((a, b) => {
    const [dateA, sessionA] = a.split("__");
    const [dateB, sessionB] = b.split("__");
    if (dateA !== dateB) return new Date(dateA) - new Date(dateB);
    return sessionA.localeCompare(sessionB);
  });

  // Prepare Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  // Header: Reg No, Name, then one column per date+session
  worksheet.addRow([
    "Reg No",
    "Name",
    ...allDateSessions.map(ds => {
      const [date, session] = ds.split("__");
      return `${date} (${session})`;
    })
  ]);

  // Rows: For each student, fill status for each date+session
  batch.students.forEach(student => {
    const statusByDateSession = {};
    (student.attendance || []).forEach(record => {
      statusByDateSession[`${record.date}__${record.session}`] = record.status;
    });
    worksheet.addRow([
      student.regNo,
      student.name,
      ...allDateSessions.map(ds => statusByDateSession[ds] || "")
    ]);
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${batchName}_attendance.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// Get marks for a batch for a specific date
app.get("/api/batches/:batchName/marks/:date", async (req, res) => {
  const { batchName, date } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const marksByRegNo = {};
  batch.students.forEach(student => {
    const record = (student.marksHistory || []).find(mh => mh.date === date);
    if (record) {
      marksByRegNo[student.regNo] = record.marks;
    }
  });
  res.json({ marks: marksByRegNo });
});

// Save or update marks for a batch for a specific date
app.post("/api/batches/:batchName/marks", async (req, res) => {
  const { batchName } = req.params;
  const { date, marks } = req.body;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  batch.students.forEach(student => {
    if (marks[student.regNo]) {
      // Remove any existing marks for this date
      student.marksHistory = (student.marksHistory || []).filter(mh => mh.date !== date);
      // Add new marks for this date
      student.marksHistory.push({ date, marks: marks[student.regNo] });
      // Optionally update latest marks
      student.marks = marks[student.regNo];
      student.marksLastUpdated = new Date();
    }
  });
  await batch.save();
  res.json({ success: true });
});

// API to get all Placement Done students
app.get("/api/placement-done", async (req, res) => {
  try {
    const students = await PlacementDoneStudent.find().sort({ movedAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch placement done students" });
  }
});

// Export Placement Done students as Excel
app.get("/api/placement-done/export", async (req, res) => {
  try {
    const students = await PlacementDoneStudent.find().sort({ movedAt: -1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Placement Done Students");
    worksheet.addRow([
      "Reg No",
      "Name",
      "Department",
      "Placed Company",
      "Package",
      "Placement Type",
      "Original Batch",
      "Attendance (%)",
      "Efforts",
      "Presentation",
      "Assessment",
      "Assignment",
      "Personal Email",
      "College Email",
      "Moved At"
    ]);
    students.forEach(s => {
      worksheet.addRow([
        s.regNo,
        s.name,
        s.department,
        s.placedCompany,
        s.package,
        s.placementType,
        s.originalBatch,
        s.attendancePercent ?? 0,
        s.marks?.efforts ?? 0,
        s.marks?.presentation ?? 0,
        s.marks?.assessment ?? 0,
        s.marks?.assignment ?? 0,
        s.personalEmail,
        s.collegeEmail,
        s.movedAt ? new Date(s.movedAt).toLocaleString() : ''
      ]);
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=placement_done_students.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to export placement done students" });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));