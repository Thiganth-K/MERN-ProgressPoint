import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true },
  name: { type: String, required: true },
  marks: {
    efforts: { type: Number, default: 0 },
    presentation: { type: Number, default: 0 },
    assessment: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 }
  },
  marksLastUpdated: { type: Date, default: null },
  attendance: [],
  attendancePercent: { type: Number, default: 0 }
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, unique: true },
  students: [studentSchema]
});

const Batch = mongoose.model("Batch", batchSchema);
export default Batch;