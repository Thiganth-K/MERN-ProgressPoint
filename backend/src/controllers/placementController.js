import PlacementDoneStudent from "../placementDone.model.js";
import Batch from "../batch.model.js";
import ExcelJS from "exceljs";

// Get all placement done students
export const getAllPlacementDone = async (req, res) => {
  try {
    const students = await PlacementDoneStudent.find().sort({ movedAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch placement done students" });
  }
};

// Move a student to placement done
export const moveToPlacementDone = async (req, res) => {
  const { regNo, batchName, placedCompany, package: pkg, placementType } = req.body;
  try {
    // Find the batch and student
    const batch = await Batch.findOne({ batchName });
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    
    const idx = batch.students.findIndex(s => s.regNo === regNo);
    if (idx === -1) return res.status(404).json({ error: "Student not found in batch" });

    const student = batch.students[idx];

    // Check if already in placement done
    const exists = await PlacementDoneStudent.findOne({ regNo });
    if (exists) return res.status(400).json({ error: "Student already in placement done list" });

    // Create PlacementDoneStudent document
    const placementDone = new PlacementDoneStudent({
      regNo: student.regNo,
      name: student.name,
      department: student.department,
      personalEmail: student.personalEmail,
      collegeEmail: student.collegeEmail,
      attendancePercent: student.attendancePercent,
      marks: student.marks,
      placedCompany,
      package: pkg,
      placementType,
      originalBatch: batchName,
      year: batch.year,
      movedAt: new Date()
    });
    await placementDone.save();

    // Remove student from batch
    batch.students.splice(idx, 1);
    await batch.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to move student to placement done" });
  }
};

// Export placement done students as Excel
export const exportPlacementDone = async (req, res) => {
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
};

// Update placement done student details
export const updatePlacementDone = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = [
      'placedCompany', 'package', 'placementType', 'originalBatch', 'attendancePercent', 'marks', 'personalEmail', 'collegeEmail', 'additionalOffers', 'year'
    ];

    const student = await PlacementDoneStudent.findById(id);
    if (!student) return res.status(404).json({ error: 'Placement done student not found' });

    // Apply only allowed fields
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();
    res.json({ success: true, student });
  } catch (err) {
    console.error('Update placement error:', err);
    res.status(500).json({ error: 'Failed to update placement done student' });
  }
};