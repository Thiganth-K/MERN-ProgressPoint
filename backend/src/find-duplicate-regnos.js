import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Batch from './batch.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Find all students with duplicate registration numbers
 * and export them to JSON file
 */
async function findDuplicateRegNos() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Searching for duplicate registration numbers...');
    
    // Get all batches with their students
    const batches = await Batch.find({});
    
    // Create a map to group students by regNo
    const regNoMap = new Map();
    
    batches.forEach(batch => {
      batch.students.forEach(student => {
        const regNo = student.regNo;
        
        if (!regNoMap.has(regNo)) {
          regNoMap.set(regNo, []);
        }
        
        regNoMap.get(regNo).push({
          regNo: student.regNo,
          name: student.name,
          batchName: batch.batchName,
          batchYear: batch.batchYear,
          department: batch.department,
          studentData: student
        });
      });
    });
    
    // Filter only duplicates (regNo appearing more than once)
    const duplicates = {};
    let totalDuplicateCount = 0;
    let totalStudentsAffected = 0;
    
    regNoMap.forEach((students, regNo) => {
      if (students.length > 1) {
        duplicates[regNo] = students;
        totalDuplicateCount++;
        totalStudentsAffected += students.length;
      }
    });
    
    // Prepare output data
    const outputData = {
      metadata: {
        searchDate: new Date().toISOString(),
        totalDuplicateRegNos: totalDuplicateCount,
        totalStudentsAffected: totalStudentsAffected,
        description: 'Students with duplicate registration numbers across all batches'
      },
      duplicates: duplicates
    };
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'duplicate-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `duplicate_regnos_${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(outputData, null, 2));
    
    // Display results
    console.log('\n📊 Duplicate Registration Numbers Found:\n');
    console.log(`Total duplicate RegNos: ${totalDuplicateCount}`);
    console.log(`Total students affected: ${totalStudentsAffected}\n`);
    
    if (totalDuplicateCount > 0) {
      console.log('Duplicates Summary:');
      console.log('─'.repeat(80));
      
      Object.entries(duplicates).forEach(([regNo, students]) => {
        console.log(`\n📌 RegNo: ${regNo} (${students.length} occurrences)`);
        students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.name} - ${student.batchName} (${student.department})`);
        });
      });
      
      console.log('\n─'.repeat(80));
    }
    
    console.log(`\n✅ Report saved to: ${filepath}`);
    console.log(`📁 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB\n`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
findDuplicateRegNos();
