import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Admin from "./admin.model.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch all students for a given admin
app.get("/api/admin/:adminName/students", async (req, res) => {
  const { adminName } = req.params;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    // Return full student objects
    res.json({ students: admin.students });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new student to an admin
app.post("/api/admin/:adminName/students", async (req, res) => {
  const { adminName } = req.params;
  const studentData = req.body;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    admin.students.push(studentData);
    await admin.save();
    res.json(admin.students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { adminName, adminPassword } = req.body;
  try {
    const admin = await Admin.findOne({ adminName, adminPassword });
    if (!admin) return res.status(401).json({ success: false, error: "Invalid credentials" });
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Save attendance for a date
app.post("/api/admin/:adminName/attendance", async (req, res) => {
  const { adminName } = req.params;
  const { date, attendance } = req.body; // attendance: { regNo: status, ... }
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // For each student, add or update attendance for the date
    admin.students.forEach(student => {
      if (attendance[student.regNo]) {
        // Remove existing attendance for this date if present
        student.attendance = student.attendance.filter(a => a.date.toISOString().slice(0,10) !== date);
        // Add new attendance record
        student.attendance.push({ date, status: attendance[student.regNo] });
      }
    });

    await admin.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all attendance records for an admin
app.get("/api/admin/:adminName/attendance", async (req, res) => {
  const { adminName } = req.params;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // Build attendance by date: { date: { regNo: status, ... }, ... }
    const attendanceRecords = {};
    admin.students.forEach(student => {
      student.attendance.forEach(a => {
        const date = a.date.toISOString().slice(0,10);
        if (!attendanceRecords[date]) attendanceRecords[date] = {};
        attendanceRecords[date][student.regNo] = a.status; // Use regNo as key
      });
    });

    res.json({ attendanceRecords });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add marks for a student
app.post("/api/admin/:adminName/student/:regNo/marks", async (req, res) => {
  const { adminName, regNo } = req.params;
  const { marks } = req.body;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    const student = admin.students.find(s => s.regNo === regNo);
    if (!student) return res.status(404).json({ error: "Student not found" });
    student.marks = marks;
    student.marksLastUpdated = new Date();
    await admin.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));