import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import PlacementDoneStudent from "./placementDone.model.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * DELETE ALL PLACEMENT DONE STUDENTS SCRIPT
 * 
 * This script will:
 * 1. Count all placement done students
 * 2. Display sample records
 * 3. Delete all placement done students after confirmation
 * 
 * WARNING: This is a DESTRUCTIVE operation!
 * Make sure you have a backup before running this script.
 * 
 * Usage: node src/delete-placement-done.js
 */

async function deletePlacementDoneStudents() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count placement done students
    const count = await PlacementDoneStudent.countDocuments();
    
    if (count === 0) {
      console.log('✅ No placement done students found. Nothing to delete.');
      await cleanup();
      return;
    }

    console.log(`📊 Found ${count} placement done students\n`);

    // Show sample records
    const sampleStudents = await PlacementDoneStudent.find({}).limit(5);
    console.log('📝 Sample placement done students:');
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.regNo} - ${student.name}`);
      console.log(`   Company: ${student.placedCompany}, Package: ${student.package}`);
      console.log(`   Batch: ${student.originalBatch}, Year: ${student.year}\n`);
    });

    if (count > 5) {
      console.log(`... and ${count - 5} more students\n`);
    }

    // Confirmation
    console.log('⚠️  WARNING: This will permanently delete ALL placement done students!');
    console.log('⚠️  Make sure you have taken a backup before proceeding.\n');
    
    const confirm1 = await question('Type "DELETE" to confirm deletion: ');
    
    if (confirm1 !== 'DELETE') {
      console.log('❌ Operation cancelled');
      await cleanup();
      return;
    }

    const confirm2 = await question('Are you absolutely sure? (yes/no): ');
    
    if (confirm2.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      await cleanup();
      return;
    }

    // Delete all placement done students
    console.log('\n🗑️  Deleting all placement done students...');
    const result = await PlacementDoneStudent.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} placement done students!`);
    console.log('\n' + '='.repeat(60));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total students deleted: ${result.deletedCount}`);
    console.log(`Collection: placementdone`);
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await cleanup();
  }
}

async function cleanup() {
  rl.close();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
}

// Run the script
console.log('╔═══════════════════════════════════════════╗');
console.log('║   🗑️  DELETE PLACEMENT DONE STUDENTS 🗑️  ║');
console.log('║      Remove All Placed Students           ║');
console.log('╚═══════════════════════════════════════════╝\n');

deletePlacementDoneStudents();
