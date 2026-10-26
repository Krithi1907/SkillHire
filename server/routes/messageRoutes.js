const express = require("express");
const {
  sendMessage,
  getProjectMessages,
  getMyConversations,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getMyConversations);
router.get("/project/:projectId", protect, getProjectMessages);

module.exports = router;
