import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  marks: {
    efforts: { type: Number, default: 0 },
    presentation: { type: Number, default: 0 },
    assessment: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 }
  },
  marksLastUpdated: { type: Date }, // <-- Add this line
  attendance: [
    {
      date: { type: Date, required: true },
      status: { type: String, enum: ["Present", "Absent", "On-Duty"], required: true }
    }
  ]
});

const adminSchema = new mongoose.Schema({
  adminName: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  students: [studentSchema]
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;