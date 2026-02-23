import express from "express";
import {
  exportData,
  importData,
  listExports,
  downloadExport,
  deleteExport,
  uploadAndImport
} from "../controllers/dataExportImportController.js";
import { requireSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// All data export/import routes are superadmin only
router.post("/export", requireSuperAdmin, exportData);
router.post("/import", requireSuperAdmin, importData);
router.get("/list", requireSuperAdmin, listExports);
router.get("/download/:fileName", requireSuperAdmin, downloadExport);
router.delete("/delete/:fileName", requireSuperAdmin, deleteExport);
router.post("/upload-import", requireSuperAdmin, uploadAndImport);

export default router;
