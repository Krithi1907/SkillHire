const express = require("express");
const {
  createTask,
  getProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/project/:projectId", protect, getProjectTasks);
router.put("/:taskId/status", protect, updateTaskStatus);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

module.exports = router;
