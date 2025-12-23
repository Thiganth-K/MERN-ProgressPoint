import express from "express";
import { login, logout, getAllAdmins, logAction } from "../controllers/adminController.js";

const router = express.Router();

// Admin authentication routes
router.post("/login", login);
router.post("/logout", logout);
router.post("/log-action", logAction);

// Get all admins (without passwords)
router.get("/", getAllAdmins);

export default router;