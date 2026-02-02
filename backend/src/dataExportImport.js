import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Admin from "./admin.model.js";
import Batch from "./batch.model.js";
import PlacementDoneStudent from "./placementDone.model.js";
import TimeRestriction from "./timeRestriction.model.js";

dotenv.config();

// Directory for data exports
const DATA_DIR = path.join(process.cwd(), 'data-exports');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Get current timestamp for file naming
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
};

/**
 * Export all MongoDB data to a single JSON file
 * @returns {Object} Export result with file path and metadata
 */
export const exportAllData = async () => {
  try {
    console.log('🔄 Starting MongoDB data export...');
    
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    const timestamp = getTimestamp();
    const fileName = `progresspoint_data_${timestamp}.json`;
    const filePath = path.join(DATA_DIR, fileName);

    // Fetch all data from collections
    console.log('📦 Fetching data from collections...');
    
    const [admins, batches, placementDone, timeRestrictions] = await Promise.all([
      Admin.find({}).lean(),
      Batch.find({}).lean(),
      PlacementDoneStudent.find({}).lean(),
      TimeRestriction.find({}).lean()
    ]);

    // Create comprehensive data object
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportTimestamp: timestamp,
        version: "2.0.0",
        application: "MERN-ProgressPoint",
        description: "Complete database export including all collections"
      },
      statistics: {
        totalAdmins: admins.length,
        totalBatches: batches.length,
        totalPlacementDoneStudents: placementDone.length,
        totalTimeRestrictions: timeRestrictions.length,
        totalStudentsInBatches: batches.reduce((sum, batch) => sum + (batch.students?.length || 0), 0)
      },
      collections: {
        admins: admins,
        batches: batches,
        placementDone: placementDone,
        timeRestrictions: timeRestrictions
      }
    };

    // Write to file with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf8');
    
    const fileSize = fs.statSync(filePath).size;
    const fileSizeKB = (fileSize / 1024).toFixed(2);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Data export completed successfully!');
    console.log(`📁 File location: ${filePath}`);
    console.log(`📊 Total documents exported:`);
    console.log(`   - Admins: ${admins.length}`);
    console.log(`   - Batches: ${batches.length}`);
    console.log(`   - Students: ${exportData.statistics.totalStudentsInBatches}`);
    console.log(`   - Placement Done: ${placementDone.length}`);
    console.log(`   - Time Restrictions: ${timeRestrictions.length}`);
    console.log(`📏 File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);

    return {
      success: true,
      filePath,
      fileName,
      fileSize,
      statistics: exportData.statistics,
      metadata: exportData.metadata
    };

  } catch (error) {
    console.error('❌ Data export failed:', error);
    throw error;
  }
};

/**
 * Import data from JSON file to MongoDB
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Import options
 * @param {boolean} options.clearExisting - Clear existing data before import
 * @param {Array<string>} options.collectionsToImport - Specific collections to import
 * @returns {Object} Import result with statistics
 */
export const importAllData = async (filePath, options = {}) => {
  try {
    console.log('🔄 Starting MongoDB data import...');
    
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Read and parse JSON file
    console.log('📖 Reading data file...');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const importData = JSON.parse(fileContent);

    // Validate data structure
    if (!importData.collections) {
      throw new Error('Invalid data format: missing collections object');
    }

    const { clearExisting = false, collectionsToImport = ['admins', 'batches', 'placementDone', 'timeRestrictions'] } = options;

    const importResults = {
      timestamp: new Date().toISOString(),
      collections: {},
      totalImported: 0,
      errors: []
    };

    // Define collection mappings
    const collectionMap = {
      admins: { model: Admin, data: importData.collections.admins || [] },
      batches: { model: Batch, data: importData.collections.batches || [] },
      placementDone: { model: PlacementDoneStudent, data: importData.collections.placementDone || [] },
      timeRestrictions: { model: TimeRestriction, data: importData.collections.timeRestrictions || [] }
    };

    // Import each collection
    for (const collectionName of collectionsToImport) {
      try {
        if (!collectionMap[collectionName]) {
          console.log(`⚠️  Unknown collection: ${collectionName}, skipping...`);
          continue;
        }

        const { model, data } = collectionMap[collectionName];
        
        console.log(`\n📥 Importing ${collectionName}...`);
        console.log(`   Found ${data.length} documents to import`);

        // Clear existing data if requested
        if (clearExisting) {
          const deleteResult = await model.deleteMany({});
          console.log(`   🗑️  Cleared ${deleteResult.deletedCount} existing documents`);
        }

        // Import data
        if (data.length > 0) {
          // Remove _id fields to let MongoDB generate new ones (avoid conflicts)
          const cleanData = data.map(doc => {
            const { _id, ...rest } = doc;
            return rest;
          });

          const insertResult = await model.insertMany(cleanData, { ordered: false });
          
          importResults.collections[collectionName] = {
            imported: insertResult.length,
            status: 'success'
          };
          importResults.totalImported += insertResult.length;
          
          console.log(`   ✅ Successfully imported ${insertResult.length} documents`);
        } else {
          importResults.collections[collectionName] = {
            imported: 0,
            status: 'no_data'
          };
          console.log(`   ℹ️  No data to import`);
        }

      } catch (error) {
        console.error(`   ❌ Error importing ${collectionName}:`, error.message);
        importResults.collections[collectionName] = {
          imported: 0,
          status: 'error',
          error: error.message
        };
        importResults.errors.push({
          collection: collectionName,
          error: error.message
        });
      }
    }

    console.log('\n🎉 Data import completed!');
    console.log(`📊 Total documents imported: ${importResults.totalImported}`);
    
    if (importResults.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${importResults.errors.length}`);
    }

    return {
      success: true,
      importResults,
      sourceMetadata: importData.metadata
    };

  } catch (error) {
    console.error('❌ Data import failed:', error);
    throw error;
  }
};

/**
 * List all exported data files
 * @returns {Array} List of export files with metadata
 */
export const listExportedFiles = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return [];
    }

    const files = fs.readdirSync(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    return jsonFiles.map(file => {
      const filePath = path.join(DATA_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Try to read metadata from file
      let metadata = null;
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        metadata = content.metadata;
      } catch (error) {
        // Ignore parsing errors
      }

      return {
        fileName: file,
        filePath,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        metadata
      };
    }).sort((a, b) => b.modified - a.modified); // Sort by newest first

  } catch (error) {
    console.error('Error listing export files:', error);
    return [];
  }
};

/**
 * Delete an exported data file
 * @param {string} fileName - Name of the file to delete
 * @returns {Object} Delete result
 */
export const deleteExportedFile = (fileName) => {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${fileName}`);
    }

    fs.unlinkSync(filePath);
    
    console.log(`✅ Deleted export file: ${fileName}`);
    
    return {
      success: true,
      deletedFile: fileName
    };

  } catch (error) {
    console.error('Error deleting export file:', error);
    throw error;
  }
};

// CLI support for direct execution
// Fix for Windows and cross-platform compatibility
const isMainModule = () => {
  if (!import.meta.url) return false;
  
  // Normalize paths for comparison
  const modulePath = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
  const argPath = process.argv[1].replace(/\//g, '\\');
  
  return modulePath.endsWith(argPath) || argPath.endsWith('dataExportImport.js');
};

if (isMainModule()) {
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'export':
          await exportAllData();
          break;
        
        case 'import':
          const filePath = process.argv[3];
          if (!filePath) {
            console.error('❌ Please provide a file path to import');
            console.log('Usage: node dataExportImport.js import <file-path> [--clear]');
            process.exit(1);
          }
          
          const clearExisting = process.argv.includes('--clear');
          await importAllData(filePath, { clearExisting });
          break;
        
        case 'list':
          const files = listExportedFiles();
          console.log('\n📋 Exported Data Files:');
          files.forEach((file, index) => {
            console.log(`\n${index + 1}. ${file.fileName}`);
            console.log(`   Size: ${file.sizeKB} KB`);
            console.log(`   Created: ${file.created.toLocaleString()}`);
            if (file.metadata) {
              console.log(`   Export Date: ${new Date(file.metadata.exportDate).toLocaleString()}`);
            }
          });
          break;
        
        default:
          console.log('ProgressPoint Data Export/Import Utility\n');
          console.log('Usage:');
          console.log('  node dataExportImport.js export              - Export all data to JSON');
          console.log('  node dataExportImport.js import <file-path>  - Import data from JSON');
          console.log('  node dataExportImport.js import <file-path> --clear  - Clear existing data and import');
          console.log('  node dataExportImport.js list                - List all exported files');
      }
      
      await mongoose.disconnect();
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      await mongoose.disconnect();
      process.exit(1);
    }
  })();
}
