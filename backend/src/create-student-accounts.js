import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import Batch from "./batch.model.js";
import PlacementDoneStudent from "./placementDone.model.js";
import StudentAuth from "./studentAuth.model.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * CREATE STUDENT AUTH ACCOUNTS SCRIPT
 * 
 * This script will:
 * 1. Find all students from batches and placement done collection
 * 2. Create student auth accounts for each student
 * 3. Set default password as registration number
 * 
 * Usage: node src/create-student-accounts.js
 */

async function createStudentAccounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Ask for default password option
    console.log('📋 Password Options:');
    console.log('1. Use Registration Number as password (e.g., REG001)');
    console.log('2. Use custom password for all students');
    console.log('3. Use student name as password\n');

    const passwordOption = await question('Select password option (1/2/3): ');
    let customPassword = null;

    if (passwordOption === '2') {
      customPassword = await question('Enter custom password for all students: ');
      if (!customPassword) {
        console.log('❌ Password cannot be empty!');
        await cleanup();
        return;
      }
    }

    // Collect all students
    console.log('\n🔍 Collecting all students...');
    const allStudents = [];

    // Get students from batches
    const batches = await Batch.find({});
    batches.forEach(batch => {
      batch.students.forEach(student => {
        allStudents.push({
          regNo: student.regNo,
          name: student.name,
          source: `Batch: ${batch.batchName}`
        });
      });
    });

    // Get students from placement done
    const placedStudents = await PlacementDoneStudent.find({});
    placedStudents.forEach(student => {
      // Check if student already added from batch
      const exists = allStudents.find(s => s.regNo === student.regNo);
      if (!exists) {
        allStudents.push({
          regNo: student.regNo,
          name: student.name,
          source: 'Placement Done'
        });
      }
    });

    console.log(`\n✅ Found ${allStudents.length} students\n`);

    if (allStudents.length === 0) {
      console.log('❌ No students found!');
      await cleanup();
      return;
    }

    // Show sample
    console.log('📝 Sample students:');
    allStudents.slice(0, 5).forEach((student, index) => {
      console.log(`${index + 1}. ${student.regNo} - ${student.name} (${student.source})`);
    });
    if (allStudents.length > 5) {
      console.log(`... and ${allStudents.length - 5} more students\n`);
    }

    const confirm = await question('\n⚠️  Do you want to create auth accounts for all these students? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      await cleanup();
      return;
    }

    // Create student auth accounts
    console.log('\n🚀 Creating student auth accounts...\n');
    
    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    for (const student of allStudents) {
      try {
        // Check if auth already exists
        const existingAuth = await StudentAuth.findOne({ regNo: student.regNo });
        if (existingAuth) {
          results.skipped.push({
            regNo: student.regNo,
            reason: 'Account already exists'
          });
          continue;
        }

        // Determine password based on option
        let password;
        if (passwordOption === '1') {
          password = student.regNo; // Use regNo as password
        } else if (passwordOption === '2') {
          password = customPassword; // Use custom password
        } else if (passwordOption === '3') {
          password = student.name.replace(/\s+/g, ''); // Use name without spaces
        } else {
          password = student.regNo; // Default to regNo
        }

        // Create student auth
        const studentAuth = new StudentAuth({
          regNo: student.regNo,
          password: password
        });

        await studentAuth.save();
        results.created.push({
          regNo: student.regNo,
          name: student.name
        });

        console.log(`✅ Created account for ${student.regNo} - ${student.name}`);
      } catch (error) {
        results.errors.push({
          regNo: student.regNo,
          reason: error.message
        });
        console.error(`❌ Failed for ${student.regNo}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Students: ${allStudents.length}`);
    console.log(`✅ Created: ${results.created.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    console.log('='.repeat(60));

    if (results.skipped.length > 0) {
      console.log('\n📝 Skipped Accounts:');
      results.skipped.forEach(item => {
        console.log(`  ${item.regNo}: ${item.reason}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(item => {
        console.log(`  ${item.regNo}: ${item.reason}`);
      });
    }

    console.log('\n✅ Student auth account creation completed!');

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
console.log('║   👨‍🎓 CREATE STUDENT AUTH ACCOUNTS 👨‍🎓    ║');
console.log('║     Generate Login Credentials            ║');
console.log('╚═══════════════════════════════════════════╝\n');

createStudentAccounts();
