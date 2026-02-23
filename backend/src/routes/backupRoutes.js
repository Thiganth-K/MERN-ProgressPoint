import express from "express";
import {
  createDatabaseBackup,
  restoreDatabaseBackup,
  listDatabaseBackups,
  deleteDatabaseBackup,
  downloadBackup
} from "../controllers/backupController.js";
import { requireSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// All backup routes require superadmin JWT
router.post("/create", requireSuperAdmin, createDatabaseBackup);
router.post("/restore/:timestamp", requireSuperAdmin, restoreDatabaseBackup);
router.delete("/delete/:timestamp", requireSuperAdmin, deleteDatabaseBackup);
router.get("/list", requireSuperAdmin, listDatabaseBackups);
router.get("/download/:timestamp", requireSuperAdmin, downloadBackup);

export default router;