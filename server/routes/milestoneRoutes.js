const express = require("express");
const {
  createMilestone,
  getProjectMilestones,
  updateMilestoneStatus,
  deleteMilestone,
} = require("../controllers/milestoneController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMilestone);
router.get("/project/:projectId", protect, getProjectMilestones);
router.put("/:milestoneId/status", protect, updateMilestoneStatus);
router.delete("/:milestoneId", protect, deleteMilestone);

module.exports = router;
