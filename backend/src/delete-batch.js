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
 * DELETE BATCH SCRIPT - Remove specific batch by name
 * 
 * This script will:
 * 1. Find batch by name (exact match)
 * 2. Clear all student data (marks, attendance, details)
 * 3. Clear admin logs related to this batch
 * 4. Delete the batch entirely
 * 
 * WARNING: This is a DESTRUCTIVE operation and cannot be undone!
 * 
 * Usage: node src/delete-batch.js "Batch Name"
 */

async function deleteBatch() {
  try {
    // Get batch name from command line argument
    const batchNameArg = process.argv[2];
    
    if (!batchNameArg) {
      console.log('❌ Error: Batch name is required');
      console.log('\nUsage: npm run delete-batch "Batch Name"');
      console.log('   or: node src/delete-batch.js "Batch Name"\n');
      await cleanup();
      return;
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the batch by name (exact match, case-sensitive)
    const batch = await Batch.findOne({ batchName: batchNameArg });
    
    if (!batch) {
      console.log(`❌ Batch "${batchNameArg}" not found\n`);
      
      // Show available batches
      const allBatches = await Batch.find({}, 'batchName year');
      if (allBatches.length > 0) {
        console.log('Available batches:');
        allBatches.forEach((b, idx) => {
          console.log(`   ${idx + 1}. "${b.batchName}" (Year: ${b.year})`);
        });
      }
      console.log('');
      
      await cleanup();
      return;
    }

    // Calculate statistics
    let totalMarks = 0;
    let totalAttendance = 0;

    batch.students.forEach(student => {
      if (student.marksHistory) {
        totalMarks += student.marksHistory.length;
      }
      if (student.attendance) {
        totalAttendance += student.attendance.length;
      }
    });

    console.log(`🔍 Found batch: "${batch.batchName}"\n`);
    console.log('📊 Batch Details:');
    console.log(`   - Batch Name: ${batch.batchName}`);
    console.log(`   - Year: ${batch.year}`);
    console.log(`   - Department: ${batch.department || 'N/A'}`);
    console.log(`   - Total Students: ${batch.students.length}`);
    console.log(`   - Marks Records: ${totalMarks}`);
    console.log(`   - Attendance Records: ${totalAttendance}\n`);

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete:');
    console.log('   ✗ All student records');
    console.log('   ✗ All marks and marks history');
    console.log('   ✗ All attendance records');
    console.log('   ✗ All admin logs related to this batch');
    console.log('   ✗ The batch document itself\n');

    const confirm1 = await question(`Type the batch name "${batch.batchName}" to confirm deletion: `);
    
    if (confirm1.trim() !== batch.batchName) {
      console.log('❌ Operation cancelled - batch name did not match');
      await cleanup();
      return;
    }

    const confirm2 = await question('Are you absolutely sure? Type "DELETE" to proceed: ');
    
    if (confirm2.trim().toUpperCase() !== 'DELETE') {
      console.log('❌ Operation cancelled');
      await cleanup();
      return;
    }

    console.log('\n🗑️  Starting deletion process...\n');

    // Step 1: Clear admin logs related to this batch
    console.log('Step 1: Clearing admin logs...');
    const admins = await Admin.find({});
    let totalLogsCleared = 0;

    for (const admin of admins) {
      // Check if activityLog exists
      if (!admin.activityLog) {
        admin.activityLog = [];
        continue;
      }

      const originalLogCount = admin.activityLog.length;
      
      // Filter out logs related to this batch
      admin.activityLog = admin.activityLog.filter(log => {
        const isBatchRelated = log.details?.batchName === batch.batchName;
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

    // Step 2: Delete the batch
    console.log('Step 2: Deleting batch...');
    console.log(`   🗑️  Deleting: ${batch.batchName}`);
    console.log(`      - Students: ${batch.students.length}`);
    console.log(`      - Marks records: ${totalMarks}`);
    console.log(`      - Attendance records: ${totalAttendance}`);

    await Batch.findByIdAndDelete(batch._id);
    console.log(`   ✅ Deleted successfully\n`);

    // Final summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 DELETION COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`✓ Batch deleted: ${batch.batchName}`);
    console.log(`✓ Students removed: ${batch.students.length}`);
    console.log(`✓ Marks records cleared: ${totalMarks}`);
    console.log(`✓ Attendance records cleared: ${totalAttendance}`);
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
console.log('║     🗑️  DELETE BATCH SCRIPT 🗑️           ║');
console.log('║       Remove Batch by Name                ║');
console.log('╚═══════════════════════════════════════════╝\n');

deleteBatch();
