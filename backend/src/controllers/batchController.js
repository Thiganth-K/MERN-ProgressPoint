import Batch from "../batch.model.js";
import ExcelJS from "exceljs";

// Get all batches
export const getAllBatches = async (req, res) => {
  const batches = await Batch.find();
  res.json({ batches });
};

// Create new batch
export const createBatch = async (req, res) => {
  const { batchName, students, year } = req.body;
  try {
    const batch = new Batch({
      batchName,
      year,
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
      return res.status(400).json({ success: false, error: "Batch name already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add students to batch
export const addStudentsToBatch = async (req, res) => {
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
};

// Get students of a batch
export const getBatchStudents = async (req, res) => {
  const { batchName } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  res.json({ students: batch.students });
};

// Remove student from batch
export const removeStudentFromBatch = async (req, res) => {
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
};

// Delete batch
export const deleteBatch = async (req, res) => {
  const { batchName } = req.params;
  try {
    await Batch.deleteOne({ batchName });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// Update batch (edit batch name and year)
export const updateBatch = async (req, res) => {
  const { batchName } = req.params;
  const { newBatchName, newYear } = req.body;
  
  try {
    const batch = await Batch.findOne({ batchName });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Check if new batch name already exists (if it's different from current)
    if (newBatchName !== batchName) {
      const existingBatch = await Batch.findOne({ batchName: newBatchName });
      if (existingBatch) {
        return res.status(400).json({ error: "New batch name already exists" });
      }
    }

    // Update batch details
    batch.batchName = newBatchName;
    batch.year = newYear;
    
    await batch.save();
    res.json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ error: "Failed to update batch" });
  }
};

// Export students as Excel
export const exportStudents = async (req, res) => {
  const { batchName } = req.params;
  const batch = await Batch.findOne({ batchName });
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  worksheet.addRow([
    "Reg No",
    "Name",
    "Efforts",
    "Presentation",
    "Assessment",
    "Assignment",
    "Attendance (%)"
  ]);

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

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${batchName}_students.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

// Search for a student by registration number across all batches
export const searchStudentByRegNo = async (req, res) => {
  const { regNo } = req.params;
  try {
    const batches = await Batch.find({});
    let foundStudent = null;
    let foundBatch = null;

    for (const batch of batches) {
      const student = batch.students.find(s => s.regNo === regNo);
      if (student) {
        foundStudent = student;
        foundBatch = {
          batchName: batch.batchName,
          year: batch.year
        };
        break;
      }
    }

    if (!foundStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ 
      student: foundStudent, 
      batch: foundBatch 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search student' });
  }
};

// Get batch averages
export const getBatchAverages = async (req, res) => {
  try {
    const batches = await Batch.find({});
    const result = batches.map(batch => {
      const students = batch.students || [];
      const total = { efforts: 0, presentation: 0, assignment: 0, assessment: 0, attendance: 0 };
      students.forEach(s => {
        total.efforts += s.marks?.efforts || 0;
        total.presentation += s.marks?.presentation || 0;
        total.assignment += s.marks?.assignment || 0;
        total.assessment += s.marks?.assessment || 0;
        total.attendance += Number(s.attendancePercent) || 0;
      });
      const count = students.length || 1;
      return {
        batchName: batch.batchName,
        averages: {
          efforts: +(total.efforts / count).toFixed(2),
          presentation: +(total.presentation / count).toFixed(2),
          assignment: +(total.assignment / count).toFixed(2),
          assessment: +(total.assessment / count).toFixed(2),
        },
        attendancePercent: +(total.attendance / count).toFixed(2)
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batch averages' });
  }
};