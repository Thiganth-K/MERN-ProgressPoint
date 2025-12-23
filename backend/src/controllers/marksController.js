import Batch from "../batch.model.js";

// Update marks for a student in a batch
export const updateStudentMarks = async (req, res) => {
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
};

// Get marks for a batch for a specific date
export const getMarksForDate = async (req, res) => {
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
};

// Save or update marks for a batch for a specific date
export const saveMarksForDate = async (req, res) => {
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
};