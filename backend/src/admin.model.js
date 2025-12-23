import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      "login", 
      "logout", 
      "mark_attendance", 
      "view_attendance", 
      "update_marks", 
      "view_marks", 
      "view_leaderboard", 
      "search_student",
      "export_data",
      "view_batch_students",
      "batch_selection"
    ], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  details: {
    batchName: String,
    studentRegNo: String,
    action: String,
    metadata: mongoose.Schema.Types.Mixed
  }
});

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  logs: [logSchema]
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;