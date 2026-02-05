import Admin from "../admin.model.js";
import Batch from "../batch.model.js";

// Get all admin logs
export const getAllLogs = async (req, res) => {
  try {
    const admins = await Admin.find({}, "adminName logs");
    res.json({ logs: admins.map(a => ({ adminName: a.adminName, logs: a.logs })) });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all admins for management
export const getAdmins = async (req, res) => {
  const admins = await Admin.find({}, "adminName adminPassword"); // include _id by default
  res.json({ admins });
};

// Create new admin
export const createAdmin = async (req, res) => {
  const { adminName, adminPassword } = req.body;
  try {
    const admin = new Admin({ adminName, adminPassword, logs: [] });
    await admin.save();
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
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
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Move student between batches
export const moveStudent = async (req, res) => {
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
};

// Clear all logs
export const clearLogs = async (req, res) => {
  try {
    await Admin.updateMany({}, { $set: { logs: [] } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get student details by regNo across all batches
export const getStudentByRegNo = async (req, res) => {
  try {
    const { regNo } = req.params;
    const batches = await Batch.find();
    
    let foundStudent = null;
    let foundBatch = null;
    
    for (const batch of batches) {
      const student = batch.students.find(s => s.regNo === regNo);
      if (student) {
        foundStudent = student;
        foundBatch = batch;
        break;
      }
    }
    
    if (!foundStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    res.json({
      student: foundStudent,
      batchName: foundBatch.batchName,
      year: foundBatch.year
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student details
export const updateStudent = async (req, res) => {
  try {
    const { batchName, regNo } = req.params;
    const updates = req.body;
    
    const batch = await Batch.findOne({ batchName });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    const student = batch.students.find(s => s.regNo === regNo);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    // Update allowed fields
    if (updates.name !== undefined) student.name = updates.name;
    if (updates.department !== undefined) student.department = updates.department;
    if (updates.personalEmail !== undefined) student.personalEmail = updates.personalEmail;
    if (updates.collegeEmail !== undefined) student.collegeEmail = updates.collegeEmail;
    if (updates.mobile !== undefined) student.mobile = updates.mobile;
    
    // Update regNo if changed
    if (updates.regNo !== undefined && updates.regNo !== regNo) {
      // Check if new regNo already exists
      const exists = batch.students.some(s => s.regNo === updates.regNo);
      if (exists) {
        return res.status(400).json({ error: "Registration number already exists" });
      }
      student.regNo = updates.regNo;
    }
    
    await batch.save();
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { batchName, regNo } = req.params;
    
    const batch = await Batch.findOne({ batchName });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    const studentIndex = batch.students.findIndex(s => s.regNo === regNo);
    if (studentIndex === -1) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    batch.students.splice(studentIndex, 1);
    await batch.save();
    
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new student to batch
export const addStudent = async (req, res) => {
  try {
    const { batchName } = req.params;
    const studentData = req.body;
    
    const batch = await Batch.findOne({ batchName });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    // Check if student with same regNo already exists
    const exists = batch.students.some(s => s.regNo === studentData.regNo);
    if (exists) {
      return res.status(400).json({ error: "Student with this registration number already exists" });
    }
    
    // Create new student
    const newStudent = {
      regNo: studentData.regNo,
      name: studentData.name,
      department: studentData.department || "",
      personalEmail: studentData.personalEmail || "",
      collegeEmail: studentData.collegeEmail || "",
      mobile: studentData.mobile || "",
      marks: {
        efforts: 0,
        presentation: 0,
        assessment: 0,
        assignment: 0
      },
      marksHistory: [],
      attendance: [],
      attendancePercent: 0
    };
    
    batch.students.push(newStudent);
    await batch.save();
    
    res.json({ success: true, student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};