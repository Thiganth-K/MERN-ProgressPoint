import {
  exportAllData,
  importAllData,
  listExportedFiles,
  deleteExportedFile
} from "../dataExportImport.js";
import path from "path";
import fs from "fs";

/**
 * API endpoint to export all MongoDB data to a single JSON file
 */
export const exportData = async (req, res) => {
  try {
    const result = await exportAllData();
    res.json({
      success: true,
      message: "Data exported successfully",
      fileName: result.fileName,
      filePath: result.filePath,
      fileSize: result.fileSize,
      statistics: result.statistics,
      metadata: result.metadata
    });
  } catch (error) {
    console.error("Data export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export data",
      details: error.message
    });
  }
};

/**
 * API endpoint to import data from uploaded JSON file
 */
export const importData = async (req, res) => {
  try {
    const { filePath, clearExisting = false, collectionsToImport } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required"
      });
    }

    const result = await importAllData(filePath, {
      clearExisting,
      collectionsToImport
    });

    res.json({
      success: true,
      message: "Data imported successfully",
      importResults: result.importResults,
      sourceMetadata: result.sourceMetadata
    });
  } catch (error) {
    console.error("Data import error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to import data",
      details: error.message
    });
  }
};

/**
 * API endpoint to list all exported data files
 */
export const listExports = async (req, res) => {
  try {
    const files = listExportedFiles();
    
    res.json({
      success: true,
      files: files.map(file => ({
        fileName: file.fileName,
        size: file.size,
        sizeKB: file.sizeKB,
        sizeMB: file.sizeMB,
        created: file.created,
        modified: file.modified,
        metadata: file.metadata
      }))
    });
  } catch (error) {
    console.error("List exports error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list exported files",
      details: error.message
    });
  }
};

/**
 * API endpoint to download an exported data file
 */
export const downloadExport = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "File name is required"
      });
    }

    const DATA_DIR = path.join(process.cwd(), 'data-exports');
    const filePath = path.join(DATA_DIR, fileName);

    // Security check: ensure file is within DATA_DIR
    const resolvedPath = path.resolve(filePath);
    const resolvedDataDir = path.resolve(DATA_DIR);
    
    if (!resolvedPath.startsWith(resolvedDataDir)) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found"
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Download export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to download file",
      details: error.message
    });
  }
};

/**
 * API endpoint to delete an exported data file
 */
export const deleteExport = async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "File name is required"
      });
    }

    const result = deleteExportedFile(fileName);
    
    res.json({
      success: true,
      message: "Export file deleted successfully",
      deletedFile: result.deletedFile
    });
  } catch (error) {
    console.error("Delete export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete export file",
      details: error.message
    });
  }
};

/**
 * API endpoint to upload and import a JSON file
 */
export const uploadAndImport = async (req, res) => {
  try {
    // This would typically handle file upload via multer
    // For now, we expect the file to be already uploaded to data-exports
    const { fileName, clearExisting = false } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "File name is required"
      });
    }

    const DATA_DIR = path.join(process.cwd(), 'data-exports');
    const filePath = path.join(DATA_DIR, fileName);

    const result = await importAllData(filePath, { clearExisting });

    res.json({
      success: true,
      message: "Data imported successfully",
      importResults: result.importResults,
      sourceMetadata: result.sourceMetadata
    });
  } catch (error) {
    console.error("Upload and import error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to import data",
      details: error.message
    });
  }
};
