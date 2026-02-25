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
  
  // Validate required fields
  if (!batchName || !year) {
    return res.status(400).json({ 
      success: false, 
      error: "Batch name and year are required" 
    });
  }
  
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
    console.error("Error creating batch:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: "Batch name already exists" });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
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
  workbook.creator = 'ProgressPoint';
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Students");
  const TOTAL_COLS = 10;

  // Set column widths first so merging works correctly
  worksheet.columns = [
    { width: 6 },  // S.No
    { width: 14 }, // Reg No
    { width: 22 }, // Name
    { width: 12 }, // Department
    { width: 28 }, // Email
    { width: 10 }, // Efforts
    { width: 14 }, // Presentation
    { width: 12 }, // Assessment
    { width: 12 }, // Assignment
    { width: 14 }  // Attendance
  ];

  // ── Row 1: ProgressPoint brand title ──────────────────────────────
  worksheet.mergeCells(1, 1, 1, TOTAL_COLS);
  const brandRow = worksheet.getRow(1);
  brandRow.height = 36;
  const brandCell = worksheet.getCell('A1');
  brandCell.value = 'ProgressPoint';
  brandCell.font = { name: 'Calibri', bold: true, size: 20, color: { argb: 'FFFFFFFF' } };
  brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  brandCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ── Row 2: subtitle ───────────────────────────────────────────────
  worksheet.mergeCells(2, 1, 2, TOTAL_COLS);
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = 'Student Batch Performance Report';
  subtitleCell.font = { name: 'Calibri', italic: true, size: 12, color: { argb: 'FFFFFFFF' } };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // ── Row 3: batch info ─────────────────────────────────────────────
  worksheet.mergeCells(3, 1, 3, 5);
  const batchInfoCell = worksheet.getCell('A3');
  batchInfoCell.value = `Batch: ${batchName}  |  Year: ${batch.year || '-'}`;
  batchInfoCell.font = { bold: true, size: 11, color: { argb: 'FF1E3A5F' } };
  batchInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  batchInfoCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  worksheet.mergeCells(3, 6, 3, TOTAL_COLS);
  const dateCell = worksheet.getCell('F3');
  dateCell.value = `Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`;
  dateCell.font = { size: 10, color: { argb: 'FF1E3A5F' } };
  dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  dateCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
  worksheet.getRow(3).height = 18;

  // ── Row 4: total count ────────────────────────────────────────────
  worksheet.mergeCells(4, 1, 4, TOTAL_COLS);
  const countCell = worksheet.getCell('A4');
  countCell.value = `Total Students: ${batch.students.length}`;
  countCell.font = { size: 10, color: { argb: 'FF374151' } };
  countCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  countCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(4).height = 16;

  // ── Row 5: spacer ─────────────────────────────────────────────────
  worksheet.addRow([]);
  worksheet.getRow(5).height = 6;

  // ── Row 6: data column headers ────────────────────────────────────
  const headerRow = worksheet.addRow([
    "S.No", "Reg No", "Name", "Department", "Email",
    "Efforts", "Presentation", "Assessment", "Assignment", "Attendance (%)"
  ]);
  headerRow.height = 20;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } }
    };
  });

  // ── Data rows ─────────────────────────────────────────────────────
  batch.students.forEach((s, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      s.regNo,
      s.name,
      s.department || '-',
      s.personalEmail || s.collegeEmail || '-',
      s.marks?.efforts ?? 0,
      s.marks?.presentation ?? 0,
      s.marks?.assessment ?? 0,
      s.marks?.assignment ?? 0,
      s.attendancePercent ?? 0
    ]);
    if (idx % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F5FF' } };
      });
    }
  });

  // ── Footer row ────────────────────────────────────────────────────
  worksheet.addRow([]);
  const lastRowNum = worksheet.rowCount + 1;
  worksheet.mergeCells(lastRowNum, 1, lastRowNum, TOTAL_COLS);
  const footerCell = worksheet.getCell(`A${lastRowNum}`);
  footerCell.value = 'This report is generated by ProgressPoint — Confidential & for internal use only.';
  footerCell.font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
  footerCell.alignment = { horizontal: 'center' };

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