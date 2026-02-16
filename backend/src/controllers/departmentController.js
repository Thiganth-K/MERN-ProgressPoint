import Batch from "../batch.model.js";
import ExcelJS from "exceljs";

/**
 * Get all unique departments from all batches
 */
export const getAllDepartments = async (req, res) => {
  try {
    const batches = await Batch.find();
    const departmentSet = new Set();
    
    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }
      
      batch.students.forEach(student => {
        if (student.department && student.department.trim()) {
          const dept = student.department.trim();
          departmentSet.add(dept);
        }
      });
    });
    
    const departments = Array.from(departmentSet).sort();
    console.log('Found departments:', departments);
    res.json({ departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

/**
 * Get all students from a specific department (across all batches)
 */
export const getDepartmentStudents = async (req, res) => {
  try {
    const { department } = req.params;
    const batches = await Batch.find();
    
    console.log('Fetching students for department:', department);
    
    const students = [];
    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }
      
      batch.students.forEach(student => {
        const studentDept = student.department ? student.department.trim() : '';
        const requestedDept = department.trim();
        
        // Case-insensitive comparison
        if (studentDept.toLowerCase() === requestedDept.toLowerCase()) {
          students.push({
            ...student.toObject(),
            batchName: batch.batchName,
            year: batch.year
          });
        }
      });
    });
    
    console.log(`Found ${students.length} students in ${department}`);
    
    res.json({ students, department });
  } catch (err) {
    console.error('Error fetching department students:', err);
    res.status(500).json({ error: "Failed to fetch department students" });
  }
};

/**
 * Get department statistics (total students, average marks, attendance)
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const batches = await Batch.find();
    const departmentStats = {};
    
    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }
      
      batch.students.forEach(student => {
        const dept = student.department?.trim() || "Unassigned";
        
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            department: dept,
            totalStudents: 0,
            totalMarks: 0,
            totalAttendance: 0,
            batches: new Set()
          };
        }
        
        departmentStats[dept].totalStudents += 1;
        departmentStats[dept].batches.add(batch.batchName);
        
        const marks = student.marks || {};
        const totalMarks = (marks.efforts || 0) + (marks.presentation || 0) + 
                          (marks.assessment || 0) + (marks.assignment || 0);
        departmentStats[dept].totalMarks += totalMarks;
        departmentStats[dept].totalAttendance += student.attendancePercent || 0;
      });
    });
    
    // Calculate averages
    const stats = Object.values(departmentStats).map(dept => ({
      department: dept.department,
      totalStudents: dept.totalStudents,
      averageMarks: dept.totalStudents > 0 ? (dept.totalMarks / dept.totalStudents).toFixed(2) : 0,
      averageAttendance: dept.totalStudents > 0 ? (dept.totalAttendance / dept.totalStudents).toFixed(2) : 0,
      batchCount: dept.batches.size
    }));
    
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department statistics" });
  }
};

/**
 * Export department students as Excel
 */
export const exportDepartmentStudents = async (req, res) => {
  try {
    const { department } = req.params;
    const batches = await Batch.find();
    
    const students = [];
    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }
      
      batch.students.forEach(student => {
        if (student.department && student.department.trim() === department) {
          students.push({
            ...student.toObject(),
            batchName: batch.batchName,
            year: batch.year
          });
        }
      });
    });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(department);
    
    worksheet.addRow([
      "Reg No",
      "Name",
      "Department",
      "Email",
      "Mobile",
      "Batch",
      "Year",
      "Efforts",
      "Presentation",
      "Assessment",
      "Assignment",
      "Total Marks",
      "Attendance (%)"
    ]);
    
    students.forEach(s => {
      const totalMarks = (s.marks?.efforts || 0) + (s.marks?.presentation || 0) + 
                        (s.marks?.assessment || 0) + (s.marks?.assignment || 0);
      worksheet.addRow([
        s.regNo,
        s.name,
        s.department || "-",
        s.personalEmail || s.collegeEmail || "-",
        s.mobile || "-",
        s.batchName,
        s.year,
        s.marks?.efforts || 0,
        s.marks?.presentation || 0,
        s.marks?.assessment || 0,
        s.marks?.assignment || 0,
        totalMarks,
        s.attendancePercent || 0
      ]);
    });
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${department}_students.xlsx`
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to export department students" });
  }
};

/**
 * Search student by regNo across all departments
 */
export const searchStudentByRegNo = async (req, res) => {
  try {
    const { regNo } = req.params;
    const batches = await Batch.find();
    
    let foundStudent = null;
    let foundBatch = null;
    
    for (const batch of batches) {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        continue;
      }
      
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
      year: foundBatch.year,
      department: foundStudent.department || "Not assigned"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to search student" });
  }
};

/**
 * Get department averages for charts
 */
export const getDepartmentAverages = async (req, res) => {
  try {
    const batches = await Batch.find();
    const departmentData = {};
    
    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }
      
      batch.students.forEach(student => {
        const dept = student.department?.trim() || "Unassigned";
        
        if (!departmentData[dept]) {
          departmentData[dept] = {
            department: dept,
            totalStudents: 0,
            totalEfforts: 0,
            totalPresentation: 0,
            totalAssessment: 0,
            totalAssignment: 0,
            totalAttendance: 0
          };
        }
        
        departmentData[dept].totalStudents += 1;
        departmentData[dept].totalEfforts += student.marks?.efforts || 0;
        departmentData[dept].totalPresentation += student.marks?.presentation || 0;
        departmentData[dept].totalAssessment += student.marks?.assessment || 0;
        departmentData[dept].totalAssignment += student.marks?.assignment || 0;
        departmentData[dept].totalAttendance += student.attendancePercent || 0;
      });
    });
    
    const averages = Object.values(departmentData).map(dept => ({
      department: dept.department,
      averageEfforts: dept.totalStudents > 0 ? (dept.totalEfforts / dept.totalStudents).toFixed(2) : 0,
      averagePresentation: dept.totalStudents > 0 ? (dept.totalPresentation / dept.totalStudents).toFixed(2) : 0,
      averageAssessment: dept.totalStudents > 0 ? (dept.totalAssessment / dept.totalStudents).toFixed(2) : 0,
      averageAssignment: dept.totalStudents > 0 ? (dept.totalAssignment / dept.totalStudents).toFixed(2) : 0,
      attendancePercent: dept.totalStudents > 0 ? (dept.totalAttendance / dept.totalStudents).toFixed(2) : 0,
      totalStudents: dept.totalStudents
    }));
    
    res.json(averages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department averages" });
  }
};

/**
 * Get attendance for a specific department by date and session
 */
export const getDepartmentAttendance = async (req, res) => {
  try {
    const { department } = req.params;
    const { date, session } = req.query;

    if (!date || !session) {
      return res.status(400).json({ error: "Date and session are required" });
    }

    const batches = await Batch.find();
    const attendanceData = {};
    let found = false;

    batches.forEach(batch => {
      // Skip NOT-WILLING batch students
      if (batch.batchName && batch.batchName.toUpperCase() === 'NOT-WILLING') {
        return;
      }

      batch.students.forEach(student => {
        const studentDept = student.department ? student.department.trim() : '';
        const requestedDept = department.trim();

        // Case-insensitive comparison
        if (studentDept.toLowerCase() === requestedDept.toLowerCase()) {
          // Find attendance record for the specific date and session
          const attendanceRecord = student.attendance.find(
            a => a.date === date && a.session === session
          );

          if (attendanceRecord) {
            attendanceData[student.regNo] = attendanceRecord.status;
            found = true;
          }
        }
      });
    });

    res.json({ 
      attendance: attendanceData, 
      found,
      date,
      session,
      department
    });
  } catch (err) {
    console.error('Error fetching department attendance:', err);
    res.status(500).json({ error: "Failed to fetch department attendance" });
  }
};
