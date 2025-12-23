import { createBackup, restoreBackup, listBackups, deleteBackup } from "../backup.js";

// API endpoint to create backup
export const createDatabaseBackup = async (req, res) => {
  try {
    const result = await createBackup();
    res.json({
      success: true,
      message: "Backup created successfully",
      backupPath: result.backupPath,
      backupInfo: result.backupInfo
    });
  } catch (error) {
    console.error("Backup creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create backup",
      details: error.message
    });
  }
};

// API endpoint to restore backup
export const restoreDatabaseBackup = async (req, res) => {
  try {
    const { timestamp } = req.params;
    
    if (!timestamp) {
      return res.status(400).json({
        success: false,
        error: "Backup timestamp is required"
      });
    }

    const result = await restoreBackup(timestamp);
    res.json({
      success: true,
      message: "Backup restored successfully",
      restoreInfo: result.restoreInfo
    });
  } catch (error) {
    console.error("Backup restore error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to restore backup",
      details: error.message
    });
  }
};

// API endpoint to list backups
export const listDatabaseBackups = async (req, res) => {
  try {
    const backups = listBackups();
    res.json({
      success: true,
      backups: backups.map(backup => ({
        timestamp: backup.timestamp,
        createdAt: backup.info?.timestamp ? new Date(backup.info.timestamp).toLocaleString() : 'Unknown',
        totalDocuments: backup.info?.totalDocuments || 0,
        collections: backup.info?.collections || {},
        sizeKB: Math.round(backup.size / 1024)
      }))
    });
  } catch (error) {
    console.error("List backups error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list backups",
      details: error.message
    });
  }
};

// API endpoint to delete backup
export const deleteDatabaseBackup = async (req, res) => {
  try {
    const { timestamp } = req.params;
    
    if (!timestamp) {
      return res.status(400).json({
        success: false,
        error: "Backup timestamp is required"
      });
    }

    const result = await deleteBackup(timestamp);
    res.json({
      success: true,
      message: "Backup deleted successfully",
      deletedBackup: result.deletedBackup
    });
  } catch (error) {
    console.error("Backup deletion error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete backup",
      details: error.message
    });
  }
};

// Download backup as ZIP (future enhancement)
export const downloadBackup = async (req, res) => {
  try {
    const { timestamp } = req.params;
    
    // This would require additional ZIP creation logic
    // For now, return the backup directory path
    res.json({
      success: true,
      message: "Backup download functionality coming soon",
      timestamp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Download failed",
      details: error.message
    });
  }
};