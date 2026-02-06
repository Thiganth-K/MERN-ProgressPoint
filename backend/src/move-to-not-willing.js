import mongoose from "mongoose";
import dotenv from "dotenv";
import Batch from "./batch.model.js";

dotenv.config();

const regNosToMove = [
  "61782323106004",
  "61782323106015",
  "61782323106018",
  "61782323106024",
  "61782323106033",
  "61782323106045",
  "61782323106046",
  "61782323106060",
  "61782323106074",
  "61782323106075",
  "61782323106076",
  "61782323106080",
  "61782323106083",
  "61782323106092",
  "61782323106098",
  "61782323106703",
  "61782323106705",
  "61782323106706",
  "61782323106501",
  "61782323106707",
  "61782323106708",
  "61782323106710",
  "61782323106116"
];

const TARGET_BATCH = "NOT-WILLING";
const TARGET_YEAR = 2027;

async function moveStudents() {
  try {
    console.log("🔗 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database\n");

    // Find or create the target batch
    let targetBatch = await Batch.findOne({ batchName: TARGET_BATCH, year: TARGET_YEAR });
    
    if (!targetBatch) {
      console.log(`📝 Creating batch "${TARGET_BATCH}" for year ${TARGET_YEAR}...`);
      targetBatch = new Batch({
        batchName: TARGET_BATCH,
        year: TARGET_YEAR,
        students: []
      });
      await targetBatch.save();
      console.log("✅ Batch created\n");
    } else {
      console.log(`✅ Found existing batch "${TARGET_BATCH}" for year ${TARGET_YEAR}\n`);
    }

    // Get all batches for year 2027
    const allBatches = await Batch.find({ year: TARGET_YEAR });
    console.log(`📊 Processing ${regNosToMove.length} registration numbers...\n`);

    let movedCount = 0;
    let notFoundCount = 0;
    let alreadyInTargetCount = 0;
    const studentsToMove = [];
    const notFound = [];

    // Find students in all batches
    for (const regNo of regNosToMove) {
      let found = false;
      let sourceBatchName = null;

      for (const batch of allBatches) {
        const studentIndex = batch.students.findIndex(s => s.regNo === regNo);
        
        if (studentIndex !== -1) {
          found = true;
          sourceBatchName = batch.batchName;

          if (batch.batchName === TARGET_BATCH) {
            console.log(`ℹ️  ${regNo} - Already in ${TARGET_BATCH}`);
            alreadyInTargetCount++;
          } else {
            const student = batch.students[studentIndex];
            studentsToMove.push({
              student,
              sourceBatch: batch,
              sourceIndex: studentIndex,
              regNo
            });
            console.log(`🔄 ${regNo} - Found in "${sourceBatchName}", will move to ${TARGET_BATCH}`);
            movedCount++;
          }
          break;
        }
      }

      if (!found) {
        console.log(`❌ ${regNo} - Not found in any batch for year ${TARGET_YEAR}`);
        notFound.push(regNo);
        notFoundCount++;
      }
    }

    // Perform the moves
    if (studentsToMove.length > 0) {
      console.log(`\n🔧 Moving ${studentsToMove.length} students...`);
      
      for (const { student, sourceBatch, sourceIndex, regNo } of studentsToMove) {
        // Remove from source batch
        sourceBatch.students.splice(sourceIndex, 1);
        await sourceBatch.save();

        // Add to target batch
        targetBatch.students.push(student);
        await targetBatch.save();
      }
      
      console.log("✅ All moves completed!");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY:");
    console.log("=".repeat(60));
    console.log(`Total registration numbers processed: ${regNosToMove.length}`);
    console.log(`✅ Successfully moved: ${movedCount}`);
    console.log(`ℹ️  Already in target batch: ${alreadyInTargetCount}`);
    console.log(`❌ Not found: ${notFoundCount}`);
    
    if (notFound.length > 0) {
      console.log("\n⚠️  Registration numbers not found:");
      notFound.forEach(regNo => console.log(`   - ${regNo}`));
    }

    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

moveStudents();
