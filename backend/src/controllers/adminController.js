import Admin from "../admin.model.js";
import { SUPER_ADMIN } from "../middleware/auth.js";
import { manualLogAction } from "../middleware/logging.js";

// Admin login
export const login = async (req, res) => {
  const { adminName, adminPassword } = req.body;
  
  if (adminName === SUPER_ADMIN.username && adminPassword === SUPER_ADMIN.password) {
    return res.json({ success: true, role: "superadmin" });
  }
  
  try {
    const admin = await Admin.findOne({ adminName, adminPassword });
    if (!admin) return res.status(401).json({ success: false, error: "Invalid credentials" });
    
    admin.logs.push({ type: "login", timestamp: new Date() });
    await admin.save();
    res.json({ success: true, role: "admin" });
  } catch {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Admin logout
export const logout = async (req, res) => {
  const { adminName } = req.body;
  try {
    const admin = await Admin.findOne({ adminName });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    
    admin.logs.push({ type: "logout", timestamp: new Date() });
    await admin.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all admins (without passwords)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, '-adminPassword'); // don't send passwords
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

// Log admin action (for frontend to log specific actions)
export const logAction = async (req, res) => {
  const { actionType, details } = req.body;
  const adminName = req.headers['x-admin-name'];
  
  if (!adminName) {
    return res.status(400).json({ error: 'Admin name required' });
  }

  try {
    await manualLogAction(adminName, actionType, details);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log action' });
  }
};