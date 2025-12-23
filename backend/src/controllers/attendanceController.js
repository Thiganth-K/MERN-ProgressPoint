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