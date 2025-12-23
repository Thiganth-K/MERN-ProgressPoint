import express from "express";
import {
  createDatabaseBackup,
  restoreDatabaseBackup,
  listDatabaseBackups,
  deleteDatabaseBackup,
  downloadBackup
} from "../controllers/backupController.js";

const router = express.Router();

// Create backup
router.post("/create", createDatabaseBackup);

// Restore backup
router.post("/restore/:timestamp", restoreDatabaseBackup);

// Delete backup
router.delete("/delete/:timestamp", deleteDatabaseBackup);

// List all backups
router.get("/list", listDatabaseBackups);

// Download backup (future enhancement)
router.get("/download/:timestamp", downloadBackup);

export default router;