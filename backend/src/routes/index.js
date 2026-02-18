import express from "express";
import adminRoutes from "./adminRoutes.js";
import superAdminRoutes from "./superAdminRoutes.js";
import batchRoutes from "./batchRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import marksRoutes from "./marksRoutes.js";
import placementRoutes from "./placementRoutes.js";
import timeRestrictionRoutes from "./timeRestrictionRoutes.js";
import backupRoutes from "./backupRoutes.js";
import dataExportImportRoutes from "./dataExportImportRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import studentRoutes from "./studentRoutes.js";
import leadManagementRoutes from "./leadManagementRoutes.js";
// Import batch controller for batch averages
import { getBatchAverages } from "../controllers/batchController.js";

const router = express.Router();

// Mount all routes
router.use("/admin", adminRoutes);
router.use("/superadmin", superAdminRoutes);
router.use("/batches", batchRoutes);
router.use("/batches", attendanceRoutes);
router.use("/batches", marksRoutes);
router.use("/placement-done", placementRoutes);
router.use("/time-restrictions", timeRestrictionRoutes);
router.use("/backup", backupRoutes);
router.use("/data", dataExportImportRoutes);
router.use("/departments", departmentRoutes);
router.use("/students", studentRoutes);
router.use("/lead-management", leadManagementRoutes);

// Keep the /admins endpoint for backward compatibility
router.use("/admins", adminRoutes);

// Batch averages endpoint (for backward compatibility)
router.get("/batch-averages", getBatchAverages);

// Simple health check for frontend connectivity tests
router.get('/ping', (req, res) => {
	res.json({ success: true, message: 'pong' });
});

export default router;