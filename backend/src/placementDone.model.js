import mongoose from "mongoose";

const placementDoneSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, default: "" },
  personalEmail: { type: String, default: "" },
  collegeEmail: { type: String, default: "" },
  attendancePercent: { type: Number, default: 0 },
  marks: {
    efforts: { type: Number, default: 0 },
    presentation: { type: Number, default: 0 },
    assessment: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 }
  },
  placedCompany: { type: String, required: true },
  package: { type: String, required: true },
  placementType: { type: String, enum: ["internship", "internship+work", "work"], required: true },
  originalBatch: { type: String, required: true },
  year: { type: Number, required: true },
  movedAt: { type: Date, default: Date.now }
});

const PlacementDoneStudent = mongoose.model("PlacementDoneStudent", placementDoneSchema);
export default PlacementDoneStudent;