import express from "express";
import {
  getAllPlacementDone,
  moveToPlacementDone,
  exportPlacementDone
} from "../controllers/placementController.js";
import { updatePlacementDone } from "../controllers/placementController.js";

const router = express.Router();

// Placement routes
router.get("/", getAllPlacementDone);
router.post("/", moveToPlacementDone);
router.get("/export", exportPlacementDone);
router.put("/:id", updatePlacementDone);

export default router;