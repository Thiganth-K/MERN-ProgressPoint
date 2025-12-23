import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Admin from "./admin.model.js";
import Batch from "./batch.model.js";
import PlacementDoneStudent from "./placementDone.model.js";
import TimeRestriction from "./timeRestriction.model.js";

dotenv.config();

// Ensure backup directory exists
const BACKUP_DIR = path.join(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Get current timestamp for backup naming
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
};

// Create backup of all collections
export const createBackup = async () => {
  try {
    console.log('🔄 Starting database backup...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const timestamp = getTimestamp();
    const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);
    
    // Create backup folder for this session
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const collections = [
      { name: 'admins', model: Admin },
      { name: 'batches', model: Batch },
      { name: 'placementdone', model: PlacementDoneStudent },
      { name: 'timerestrictions', model: TimeRestriction }
    ];

    const backupInfo = {
      timestamp: new Date().toISOString(),
      collections: {},
      totalDocuments: 0
    };

    // Backup each collection
    for (const collection of collections) {
      try {
        console.log(`📦 Backing up ${collection.name}...`);
        
        const documents = await collection.model.find({}).lean();
        const filePath = path.join(backupPath, `${collection.name}.json`);
        
        // Write to file with pretty formatting
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf8');
        
        backupInfo.collections[collection.name] = {
          documentCount: documents.length,
          filePath: filePath,
          fileSize: fs.statSync(filePath).size
        };
        
        backupInfo.totalDocuments += documents.length;
        console.log(`✅ ${collection.name}: ${documents.length} documents backed up`);
        
      } catch (error) {
        console.error(`❌ Error backing up ${collection.name}:`, error.message);
        backupInfo.collections[collection.name] = {
          error: error.message
        };
      }
    }

    // Save backup metadata
    const metaPath = path.join(backupPath, 'backup_info.json');
    fs.writeFileSync(metaPath, JSON.stringify(backupInfo, null, 2), 'utf8');

    // Create a summary file in the main backup directory
    const summaryPath = path.join(BACKUP_DIR, 'latest_backup.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      latestBackup: timestamp,
      backupPath: backupPath,
      ...backupInfo
    }, null, 2), 'utf8');

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup location: ${backupPath}`);
    console.log(`📊 Total documents backed up: ${backupInfo.totalDocuments}`);
    console.log(`⏰ Backup timestamp: ${timestamp}`);

    await mongoose.disconnect();
    return { success: true, backupPath, backupInfo };

  } catch (error) {
    console.error('❌ Backup failed:', error);
    await mongoose.disconnect();
    throw error;
  }
};

// Restore from backup
export const restoreBackup = async (backupTimestamp) => {
  try {
    console.log(`🔄 Starting database restore from backup: ${backupTimestamp}`);
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const backupPath = path.join(BACKUP_DIR, `backup_${backupTimestamp}`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }

    const collections = [
      { name: 'admins', model: Admin },
      { name: 'batches', model: Batch },
      { name: 'placementdone', model: PlacementDoneStudent },
      { name: 'timerestrictions', model: TimeRestriction }
    ];

    const restoreInfo = {
      timestamp: new Date().toISOString(),
      collections: {},
      totalDocuments: 0
    };

    // Restore each collection
    for (const collection of collections) {
      try {
        const filePath = path.join(backupPath, `${collection.name}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Skipping ${collection.name}: backup file not found`);
          continue;
        }

        console.log(`📥 Restoring ${collection.name}...`);
        
        // Read backup data
        const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (backupData.length === 0) {
          console.log(`ℹ️  ${collection.name}: No documents to restore`);
          continue;
        }

        // Clear existing collection (be careful!)
        await collection.model.deleteMany({});
        console.log(`🗑️  Cleared existing ${collection.name} collection`);
        
        // Insert backup data
        await collection.model.insertMany(backupData);
        
        restoreInfo.collections[collection.name] = {
          documentCount: backupData.length,
          restored: true
        };
        
        restoreInfo.totalDocuments += backupData.length;
        console.log(`✅ ${collection.name}: ${backupData.length} documents restored`);
        
      } catch (error) {
        console.error(`❌ Error restoring ${collection.name}:`, error.message);
        restoreInfo.collections[collection.name] = {
          error: error.message,
          restored: false
        };
      }
    }

    console.log('\n🎉 Restore completed successfully!');
    console.log(`📊 Total documents restored: ${restoreInfo.totalDocuments}`);

    await mongoose.disconnect();
    return { success: true, restoreInfo };

  } catch (error) {
    console.error('❌ Restore failed:', error);
    await mongoose.disconnect();
    throw error;
  }
};

// List available backups
export const listBackups = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 No backups directory found');
      return [];
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(item => item.startsWith('backup_') && fs.statSync(path.join(BACKUP_DIR, item)).isDirectory())
      .map(backupFolder => {
        const backupPath = path.join(BACKUP_DIR, backupFolder);
        const timestamp = backupFolder.replace('backup_', '');
        
        // Try to read backup info
        let info = null;
        try {
          const infoPath = path.join(backupPath, 'backup_info.json');
          if (fs.existsSync(infoPath)) {
            info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          }
        } catch (e) {
          // Ignore info read errors
        }

        return {
          timestamp,
          backupPath,
          info,
          size: getFolderSize(backupPath)
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

    return backups;
  } catch (error) {
    console.error('❌ Error listing backups:', error);
    return [];
  }
};

// Delete a specific backup
export const deleteBackup = async (backupTimestamp) => {
  try {
    console.log(`🗑️  Starting backup deletion: ${backupTimestamp}`);
    
    const backupPath = path.join(BACKUP_DIR, `backup_${backupTimestamp}`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }

    // Recursively delete the backup directory and all its contents
    fs.rmSync(backupPath, { recursive: true, force: true });
    
    console.log(`✅ Backup deleted successfully: ${backupTimestamp}`);
    
    // Update the latest backup summary if needed
    const remainingBackups = listBackups();
    if (remainingBackups.length > 0) {
      const latestBackup = remainingBackups[0]; // Already sorted by most recent
      const summaryPath = path.join(BACKUP_DIR, 'latest_backup.json');
      fs.writeFileSync(summaryPath, JSON.stringify({
        latestBackup: latestBackup.timestamp,
        backupPath: latestBackup.backupPath,
        ...latestBackup.info
      }, null, 2), 'utf8');
    } else {
      // Remove the latest backup summary if no backups remain
      const summaryPath = path.join(BACKUP_DIR, 'latest_backup.json');
      if (fs.existsSync(summaryPath)) {
        fs.unlinkSync(summaryPath);
      }
    }

    return { success: true, deletedBackup: backupTimestamp };

  } catch (error) {
    console.error('❌ Backup deletion failed:', error);
    throw error;
  }
};

// Helper function to calculate folder size
const getFolderSize = (folderPath) => {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    });
  } catch (error) {
    // Ignore size calculation errors
  }
  return totalSize;
};

// CLI interface
const main = async () => {
  const command = process.argv[2];
  const param = process.argv[3];

  switch (command) {
    case 'backup':
      try {
        await createBackup();
        process.exit(0);
      } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
      }
      break;

    case 'restore':
      if (!param) {
        console.error('❌ Please provide backup timestamp');
        console.log('Usage: node backup.js restore <timestamp>');
        process.exit(1);
      }
      try {
        await restoreBackup(param);
        process.exit(0);
      } catch (error) {
        console.error('Restore failed:', error);
        process.exit(1);
      }
      break;

    case 'list':
      const backups = listBackups();
      if (backups.length === 0) {
        console.log('📭 No backups found');
      } else {
        console.log('\n📋 Available backups:');
        backups.forEach(backup => {
          console.log(`\n📦 ${backup.timestamp}`);
          console.log(`   📁 Path: ${backup.backupPath}`);
          console.log(`   📏 Size: ${(backup.size / 1024).toFixed(2)} KB`);
          if (backup.info) {
            console.log(`   📊 Documents: ${backup.info.totalDocuments}`);
            console.log(`   📅 Created: ${new Date(backup.info.timestamp).toLocaleString()}`);
          }
        });
      }
      process.exit(0);
      break;

    case 'delete':
      if (!param) {
        console.error('❌ Please provide backup timestamp');
        console.log('Usage: node backup.js delete <timestamp>');
        process.exit(1);
      }
      try {
        await deleteBackup(param);
        process.exit(0);
      } catch (error) {
        console.error('Delete failed:', error);
        process.exit(1);
      }
      break;

    default:
      console.log(`
📦 Database Backup Tool

Usage:
  node backup.js backup                    - Create a new backup
  node backup.js restore <timestamp>       - Restore from backup
  node backup.js delete <timestamp>        - Delete a backup
  node backup.js list                      - List available backups

Examples:
  node backup.js backup
  node backup.js restore 2025-11-08_14-30-25
  node backup.js delete 2025-11-08_14-30-25
  node backup.js list
      `);
      process.exit(0);
  }
};

// Run CLI if this file is executed directly
if (process.argv[1] && process.argv[1].includes('backup.js')) {
  main();
}