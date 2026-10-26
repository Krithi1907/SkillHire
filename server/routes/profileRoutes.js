const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getAllFreelancers,
} = require("../controllers/profileController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/freelancers", getAllFreelancers);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/user/:userId", getProfileByUserId);

module.exports = router;
