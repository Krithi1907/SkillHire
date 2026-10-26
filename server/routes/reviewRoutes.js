const express = require("express");
const {
  createReview,
  getUserReviews,
  getProjectReviews,
} = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getUserReviews);
router.get("/project/:projectId", getProjectReviews);

module.exports = router;
