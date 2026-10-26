const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectById,
  getClientProjects,
  getFreelancerProjects,
  updateProject,
  deleteProject,
  completeProject,
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllProjects);
router.post("/", protect, createProject);
router.get("/my-posted", protect, getClientProjects);
router.get("/my-assigned", protect, getFreelancerProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.put("/:id/complete", protect, completeProject);

module.exports = router;