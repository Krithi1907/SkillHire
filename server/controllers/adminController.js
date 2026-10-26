const User = require("../models/User");
const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const Report = require("../models/Report");
const Review = require("../models/Review");

// GET PLATFORM STATISTICS
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFreelancers,
      totalClients,
      totalProjects,
      openProjects,
      activeProjects,
      completedProjects,
      totalProposals,
      pendingReports,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "freelancer" }),
      User.countDocuments({ role: "client" }),
      Project.countDocuments(),
      Project.countDocuments({ status: "open" }),
      Project.countDocuments({ status: "in-progress" }),
      Project.countDocuments({ status: "completed" }),
      Proposal.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFreelancers,
        totalClients,
        totalProjects,
        openProjects,
        activeProjects,
        completedProjects,
        totalProposals,
        pendingReports,
        totalReviews,
      },
    });
  } catch (error) {
    console.error("getPlatformStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch platform stats" });
  }
};

// GET ALL USERS (ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const query = {};

    if (role && role !== "all") query.role = role;
    if (status === "active") query.isActive = { $ne: false };
    if (status === "deactivated") query.isActive = false;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// TOGGLE USER STATUS (ACTIVATE / DEACTIVATE)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

// GET ALL PROJECTS (ADMIN)
const getAllProjectsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ title: searchRegex }, { category: searchRegex }];
    }

    const projects = await Project.find(query)
      .populate("client", "name email")
      .populate("assignedFreelancer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("getAllProjectsAdmin error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const reports = await Report.find(query)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("getAllReports error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

// UPDATE REPORT STATUS
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, actionTaken } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (status) report.status = status;
    if (actionTaken !== undefined) report.actionTaken = actionTaken;

    await report.save();

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("updateReportStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update report" });
  }
};

// GET RECENT ACTIVITY LOG
const getPlatformActivity = async (req, res) => {
  try {
    const recentUsers = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(5);
    const recentProjects = await Project.find().select("title category budget status createdAt").populate("client", "name").sort({ createdAt: -1 }).limit(5);
    const recentProposals = await Proposal.find().select("bidAmount status createdAt").populate("freelancer", "name").populate("project", "title").sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        recentUsers,
        recentProjects,
        recentProposals,
      },
    });
  } catch (error) {
    console.error("getPlatformActivity error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch platform activity" });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllProjectsAdmin,
  getAllReports,
  updateReportStatus,
  getPlatformActivity,
};
