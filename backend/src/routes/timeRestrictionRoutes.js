import express from "express";
import {
  getTimeRestrictions,
  getTimeRestrictionByType,
  setTimeRestriction,
  deleteTimeRestriction,
  checkTimeAccess
} from "../controllers/timeRestrictionController.js";
import { logAdminAction } from "../middleware/logging.js";

const router = express.Router();

// Get all time restrictions
router.get("/", getTimeRestrictions);

// Get specific time restriction by type
router.get("/:type", getTimeRestrictionByType);

// Check if current time allows access for specific type
router.get("/:type/check", checkTimeAccess);

// Create or update time restriction
router.post("/", logAdminAction("set_time_restriction", (req) => ({
  type: req.body.type,
  isEnabled: req.body.isEnabled,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  action: "Set time restriction"
})), setTimeRestriction);

// Update specific time restriction
router.put("/:type", logAdminAction("update_time_restriction", (req) => ({
  type: req.params.type,
  isEnabled: req.body.isEnabled,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  action: "Update time restriction"
})), setTimeRestriction);

// Delete time restriction
router.delete("/:type", logAdminAction("delete_time_restriction", (req) => ({
  type: req.params.type,
  action: "Delete time restriction"
})), deleteTimeRestriction);

export default router;