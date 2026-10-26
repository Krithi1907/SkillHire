const Report = require("../models/Report");

// SUBMIT REPORT
const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: "targetType, targetId, and reason are required",
      });
    }

    const report = await Report.create({
      reportedBy: req.user.id,
      targetType,
      targetId,
      reason: reason.trim(),
      description: (description || "").trim(),
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. Platform moderators will review it.",
      data: report,
    });
  } catch (error) {
    console.error("createReport error:", error);
    res.status(500).json({ success: false, message: "Failed to submit report" });
  }
};

module.exports = {
  createReport,
};
