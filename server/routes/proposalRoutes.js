const express = require("express");
const {
  submitProposal,
  getProposalsForProject,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
} = require("../controllers/proposalController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, submitProposal);
router.get("/my", protect, getMyProposals);
router.get("/project/:projectId", protect, getProposalsForProject);
router.put("/:proposalId/accept", protect, acceptProposal);
router.put("/:proposalId/reject", protect, rejectProposal);
router.put("/:proposalId/withdraw", protect, withdrawProposal);

module.exports = router;
