import mongoose from "mongoose";
import dotenv from "dotenv";
import Batch from "./batch.model.js";

dotenv.config();

async function migrateYear() {
  await mongoose.connect(process.env.MONGO_URI);

  // Update all batches to have year: 2026
  const result = await Batch.updateMany({}, { $set: { year: 2026 } });
  console.log(`Updated ${result.modifiedCount} batches to year 2026`);
  mongoose.disconnect();
}

migrateYear();