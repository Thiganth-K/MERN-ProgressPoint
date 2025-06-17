import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: { type: String, enum: ["login", "logout"], required: true },
  timestamp: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  logs: [logSchema]
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;