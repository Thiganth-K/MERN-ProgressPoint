import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert duplicate registration numbers JSON to Excel file
 */
async function exportDuplicatesToExcel() {
  try {
    // Find the most recent duplicate report
    const duplicateReportsDir = path.join(__dirname, '..', 'duplicate-reports');
    
    if (!fs.existsSync(duplicateReportsDir)) {
      console.log('❌ No duplicate reports found. Please run "npm run find-duplicates" first.');
      process.exit(1);
    }
    
    const files = fs.readdirSync(duplicateReportsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('❌ No duplicate reports found. Please run "npm run find-duplicates" first.');
      process.exit(1);
    }
    
    const latestFile = files[0];
    const jsonPath = path.join(duplicateReportsDir, latestFile);
    
    console.log(`📂 Reading: ${latestFile}`);
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    
    summarySheet.addRows([
      { metric: 'Report Date', value: new Date(data.metadata.searchDate).toLocaleString() },
      { metric: 'Total Duplicate RegNos', value: data.metadata.totalDuplicateRegNos },
      { metric: 'Total Students Affected', value: data.metadata.totalStudentsAffected }
    ]);
    
    // Style the summary header
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Sheet 2: All Duplicates (Detailed)
    const detailSheet = workbook.addWorksheet('Duplicate Details');
    detailSheet.columns = [
      { header: 'Reg No', key: 'regNo', width: 18 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Batch Name', key: 'batchName', width: 20 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Batch Year', key: 'batchYear', width: 12 },
      { header: 'Personal Email', key: 'personalEmail', width: 30 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Attendance %', key: 'attendancePercent', width: 15 },
      { header: 'Efforts', key: 'efforts', width: 10 },
      { header: 'Presentation', key: 'presentation', width: 15 },
      { header: 'Assignment', key: 'assignment', width: 15 },
      { header: 'Assessment', key: 'assessment', width: 15 }
    ];
    
    // Style the header
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Add data rows
    let currentRow = 2;
    Object.entries(data.duplicates).forEach(([regNo, students]) => {
      students.forEach((student, index) => {
        const row = detailSheet.getRow(currentRow);
        row.values = {
          regNo: student.regNo,
          name: student.name,
          batchName: student.batchName,
          department: student.department,
          batchYear: student.batchYear,
          personalEmail: student.studentData.personalEmail,
          mobile: student.studentData.mobile,
          attendancePercent: student.studentData.attendancePercent,
          efforts: student.studentData.marks.efforts,
          presentation: student.studentData.marks.presentation,
          assignment: student.studentData.marks.assignment,
          assessment: student.studentData.marks.assessment
        };
        
        // Highlight duplicate groups with alternating colors
        const fillColor = (Object.keys(data.duplicates).indexOf(regNo) % 2 === 0) 
          ? 'FFFCE4D6' 
          : 'FFE2EFDA';
        
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor }
        };
        
        currentRow++;
      });
    });
    
    // Sheet 3: Duplicate Groups (Compact view)
    const groupSheet = workbook.addWorksheet('Duplicate Groups');
    groupSheet.columns = [
      { header: 'Reg No', key: 'regNo', width: 18 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Students', key: 'students', width: 80 }
    ];
    
    // Style the header
    groupSheet.getRow(1).font = { bold: true };
    groupSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    groupSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    Object.entries(data.duplicates).forEach(([regNo, students]) => {
      const studentsList = students.map(s => 
        `${s.name} (${s.batchName} - ${s.department})`
      ).join(' | ');
      
      groupSheet.addRow({
        regNo: regNo,
        count: students.length,
        students: studentsList
      });
    });
    
    // Generate output filename
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const excelFilename = `duplicate_regnos_${timestamp}.xlsx`;
    const excelPath = path.join(duplicateReportsDir, excelFilename);
    
    // Save the workbook
    await workbook.xlsx.writeFile(excelPath);
    
    console.log('\n✅ Excel file created successfully!');
    console.log(`📁 File location: ${excelPath}`);
    console.log(`📊 File size: ${(fs.statSync(excelPath).size / 1024).toFixed(2)} KB`);
    console.log(`\n📋 Sheets created:`);
    console.log(`   1. Summary - Overview of duplicate statistics`);
    console.log(`   2. Duplicate Details - Complete student information`);
    console.log(`   3. Duplicate Groups - Grouped view by registration number\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
exportDuplicatesToExcel();
