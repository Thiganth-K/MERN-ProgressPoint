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