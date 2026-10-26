const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

// Backwards compatibility endpoint
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "You are authorized!",
    user: req.user,
  });
});

module.exports = router;