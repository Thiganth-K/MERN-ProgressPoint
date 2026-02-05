import Batch from "../batch.model.js";
import ExcelJS from "exceljs";

// Get existing attendance for a batch on a specific date and session
export const getAttendance = async (req, res) => {
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
};

// Mark attendance for a batch
export const markAttendance = async (req, res) => {
  const { batchName } = req.params;
  const { date, session, attendance } = req.body;
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
};

// Export attendance as Excel
export const exportAttendance = async (req, res) => {
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
};

// Export attendance for a specific date and session as Excel
export const exportAttendanceByDateSession = async (req, res) => {
  try {
    const { date, session } = req.params;
    const { department, batch } = req.query;

    let students = [];

    if (department) {
      // Fetch students by department
      const batches = await Batch.find({ department });
      batches.forEach(b => {
        b.students.forEach(student => {
          students.push({
            ...student.toObject(),
            batchName: b.batchName,
            department: b.department
          });
        });
      });
    } else if (batch) {
      // Fetch students by batch
      const foundBatch = await Batch.findOne({ batchName: batch });
      if (!foundBatch) {
        return res.status(404).json({ error: "Batch not found" });
      }
      students = foundBatch.students.map(student => ({
        ...student.toObject(),
        batchName: foundBatch.batchName,
        department: foundBatch.department
      }));
    } else {
      return res.status(400).json({ error: "Department or batch parameter required" });
    }

    // Filter students who have attendance for this date and session
    const attendanceRecords = [];
    students.forEach(student => {
      const record = (student.attendance || []).find(
        a => a.date === date && a.session === session
      );
      if (record) {
        attendanceRecords.push({
          regNo: student.regNo,
          name: student.name,
          batchName: student.batchName,
          department: student.department,
          personalEmail: student.personalEmail || '',
          collegeEmail: student.collegeEmail || '',
          mobile: student.mobile || '',
          status: record.status
        });
      }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add title row
    worksheet.mergeCells('A1:H1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = `Attendance Record - ${new Date(date).toLocaleDateString()} (${session})`;
    titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).height = 30;

    // Add summary row
    const present = attendanceRecords.filter(r => r.status === 'Present').length;
    const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const onDuty = attendanceRecords.filter(r => r.status === 'On-Duty').length;
    
    worksheet.getCell('A2').value = `Total: ${attendanceRecords.length} | Present: ${present} | Absent: ${absent} | On-Duty: ${onDuty}`;
    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').font = { bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Add header row manually
    const headerRow = worksheet.addRow(['#', 'Reg No', 'Name', 'Batch', 'Department', 'Personal Email', 'Mobile', 'Status']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };

    // Set column widths
    worksheet.columns = [
      { width: 8 },
      { width: 18 },
      { width: 25 },
      { width: 20 },
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 12 }
    ];

    // Add data rows
    attendanceRecords.forEach((record, index) => {
      const row = worksheet.addRow([
        index + 1,
        record.regNo,
        record.name,
        record.batchName,
        record.department,
        record.personalEmail,
        record.mobile,
        record.status
      ]);

      // Color code status
      const statusCell = row.getCell(8);
      if (record.status === 'Present') {
        statusCell.font = { color: { argb: 'FF00B050' }, bold: true };
      } else if (record.status === 'Absent') {
        statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      } else if (record.status === 'On-Duty') {
        statusCell.font = { color: { argb: 'FFFFC000' }, bold: true };
      }
    });

    // Set response headers FIRST
    const filename = `attendance_${date}_${session}_${department || batch || 'export'}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // Write directly to response stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting attendance:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to export attendance' });
    }
  }
};