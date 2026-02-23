import express from "express";
import {
  getTimeRestrictions,
  getTimeRestrictionByType,
  setTimeRestriction,
  deleteTimeRestriction,
  checkTimeAccess
} from "../controllers/timeRestrictionController.js";
import { logAdminAction } from "../middleware/logging.js";
import { requireAdminOrSuperAdmin, requireSuperAdmin } from "../middleware/jwtAuth.js";

const router = express.Router();

// Read (admin or superadmin)
router.get("/", requireAdminOrSuperAdmin, getTimeRestrictions);
router.get("/:type", requireAdminOrSuperAdmin, getTimeRestrictionByType);
router.get("/:type/check", requireAdminOrSuperAdmin, checkTimeAccess);

// Write (superadmin only)
router.post("/", requireSuperAdmin, logAdminAction("set_time_restriction", (req) => ({
  type: req.body.type,
  isEnabled: req.body.isEnabled,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  action: "Set time restriction"
})), setTimeRestriction);

router.put("/:type", requireSuperAdmin, logAdminAction("update_time_restriction", (req) => ({
  type: req.params.type,
  isEnabled: req.body.isEnabled,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  action: "Update time restriction"
})), setTimeRestriction);

router.delete("/:type", requireSuperAdmin, logAdminAction("delete_time_restriction", (req) => ({
  type: req.params.type,
  action: "Delete time restriction"
})), deleteTimeRestriction);

export default router;