import express from "express";
import {
  getAllLogs,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  moveStudent,
  clearLogs
} from "../controllers/superAdminController.js";

const router = express.Router();

// Super admin routes
router.get("/logs", getAllLogs);
router.delete("/logs", clearLogs);
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);
router.post("/move-student", moveStudent);

export default router;