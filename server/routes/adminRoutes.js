const express = require("express");
const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllProjectsAdmin,
  getAllReports,
  updateReportStatus,
  getPlatformActivity,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(protect.adminOnly);

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.put("/users/:userId/toggle-status", toggleUserStatus);
router.get("/projects", getAllProjectsAdmin);
router.get("/reports", getAllReports);
router.put("/reports/:reportId", updateReportStatus);
router.get("/activity", getPlatformActivity);

module.exports = router;
