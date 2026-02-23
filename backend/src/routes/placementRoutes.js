import express from "express";
import {
  getAllPlacementDone,
  moveToPlacementDone,
  exportPlacementDone
} from "../controllers/placementController.js";
import { updatePlacementDone } from "../controllers/placementController.js";
import { requireAdminOrSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// Public: view placement records (used in guest / client dashboard)
router.get("/", getAllPlacementDone);

// Admin/Superadmin: modify placement records
router.post("/", requireAdminOrSuperAdmin, moveToPlacementDone);
router.get("/export", requireAdminOrSuperAdmin, exportPlacementDone);
router.put("/:id", requireAdminOrSuperAdmin, updatePlacementDone);

export default router;