import express from "express";
import {
  exportData,
  importData,
  listExports,
  downloadExport,
  deleteExport,
  uploadAndImport
} from "../controllers/dataExportImportController.js";

const router = express.Router();

// Export all data to JSON
router.post("/export", exportData);

// Import data from JSON
router.post("/import", importData);

// List all exported files
router.get("/list", listExports);

// Download a specific export file
router.get("/download/:fileName", downloadExport);

// Delete a specific export file
router.delete("/delete/:fileName", deleteExport);

// Upload and import a JSON file
router.post("/upload-import", uploadAndImport);

export default router;
