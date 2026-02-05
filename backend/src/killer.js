import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Batch from './batch.model.js';
import Admin from './admin.model.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * KILLER SCRIPT - Remove all 2026 batch data
 * 
 * This script will:
 * 1. Find all batches with year 2026
 * 2. Clear all student data (marks, attendance, details)
 * 3. Clear admin logs related to these batches
 * 4. Optionally delete the batches entirely
 * 
 * WARNING: This is a DESTRUCTIVE operation and cannot be undone!
 */

async function cleanBatchData() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all batches with year 2026
    const batches2026 = await Batch.find({ year: 2026 });
    
    if (batches2026.length === 0) {
      console.log('ℹ️  No batches found with year 2026');
      await cleanup();
      return;
    }

    console.log(`🔍 Found ${batches2026.length} batches with year 2026:\n`);
    batches2026.forEach((batch, idx) => {
      console.log(`   ${idx + 1}. ${batch.batchName} - ${batch.students.length} students`);
    });
    console.log('');

    // Calculate total data
    const totalStudents = batches2026.reduce((sum, batch) => sum + batch.students.length, 0);
    const batchNames = batches2026.map(b => b.batchName);

    console.log('📊 Summary:');
    console.log(`   - Total Batches: ${batches2026.length}`);
    console.log(`   - Total Students: ${totalStudents}`);
    console.log(`   - Batch Names: ${batchNames.join(', ')}\n`);

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete:');
    console.log('   ✗ All student records');
    console.log('   ✗ All marks and marks history');
    console.log('   ✗ All attendance records');
    console.log('   ✗ All admin logs related to these batches');
    console.log('   ✗ The batch documents themselves\n');

    const confirm1 = await question('Type "DELETE 2026" to confirm deletion: ');
    
    if (confirm1.trim() !== 'DELETE 2026') {
      console.log('❌ Operation cancelled - confirmation text did not match');
      await cleanup();
      return;
    }

    const confirm2 = await question('Are you absolutely sure? Type "YES" to proceed: ');
    
    if (confirm2.trim().toUpperCase() !== 'YES') {
      console.log('❌ Operation cancelled');
      await cleanup();
      return;
    }

    console.log('\n🗑️  Starting deletion process...\n');

    // Step 1: Clear admin logs related to these batches
    console.log('Step 1: Clearing admin logs...');
    const admins = await Admin.find({});
    let totalLogsCleared = 0;

    for (const admin of admins) {
      // Check if activityLog exists, if not initialize it
      if (!admin.activityLog) {
        admin.activityLog = [];
        continue;
      }

      const originalLogCount = admin.activityLog.length;
      
      // Filter out logs related to 2026 batches
      admin.activityLog = admin.activityLog.filter(log => {
        const isBatchRelated = log.details?.batchName && batchNames.includes(log.details.batchName);
        return !isBatchRelated;
      });
      
      const clearedLogs = originalLogCount - admin.activityLog.length;
      totalLogsCleared += clearedLogs;
      
      if (clearedLogs > 0) {
        await admin.save();
        console.log(`   ✓ Cleared ${clearedLogs} logs from admin: ${admin.username}`);
      }
    }
    console.log(`   ✅ Total admin logs cleared: ${totalLogsCleared}\n`);

    // Step 2: Delete each batch and show detailed statistics
    console.log('Step 2: Deleting batches...');
    let totalMarksCleared = 0;
    let totalAttendanceCleared = 0;

    for (const batch of batches2026) {
      // Calculate marks and attendance
      let batchMarks = 0;
      let batchAttendance = 0;

      batch.students.forEach(student => {
        if (student.marksHistory) {
          batchMarks += student.marksHistory.length;
        }
        if (student.attendance) {
          batchAttendance += student.attendance.length;
        }
      });

      totalMarksCleared += batchMarks;
      totalAttendanceCleared += batchAttendance;

      console.log(`   🗑️  Deleting: ${batch.batchName}`);
      console.log(`      - Students: ${batch.students.length}`);
      console.log(`      - Marks records: ${batchMarks}`);
      console.log(`      - Attendance records: ${batchAttendance}`);

      await Batch.findByIdAndDelete(batch._id);
      console.log(`   ✅ Deleted successfully\n`);
    }

    // Final summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 DELETION COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`✓ Batches deleted: ${batches2026.length}`);
    console.log(`✓ Students removed: ${totalStudents}`);
    console.log(`✓ Marks records cleared: ${totalMarksCleared}`);
    console.log(`✓ Attendance records cleared: ${totalAttendanceCleared}`);
    console.log(`✓ Admin logs cleared: ${totalLogsCleared}`);
    console.log('═══════════════════════════════════════════\n');

    await cleanup();
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    await cleanup();
    process.exit(1);
  }
}

async function cleanup() {
  rl.close();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
}

// Run the script
console.log('╔═══════════════════════════════════════════╗');
console.log('║     🚨 BATCH DATA KILLER SCRIPT 🚨       ║');
console.log('║         Remove 2026 Batch Data            ║');
console.log('╚═══════════════════════════════════════════╝\n');

cleanBatchData();
