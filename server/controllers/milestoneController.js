const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const { createNotification } = require("../utils/notify");

const checkProjectAccess = (project, userId, userRole) => {
  if (userRole === "admin") return true;
  const isClient = project.client.toString() === userId;
  const isFreelancer =
    (project.assignedFreelancer && project.assignedFreelancer.toString() === userId) ||
    (project.selectedFreelancer && project.selectedFreelancer.toString() === userId);
  return isClient || isFreelancer;
};

// CREATE MILESTONE
const createMilestone = async (req, res) => {
  try {
    const { projectId, title, description, amount, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "Project ID and title are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create milestones on this project",
      });
    }

    const milestone = await Milestone.create({
      project: projectId,
      title: title.trim(),
      description: (description || "").trim(),
      amount: Number(amount) || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
    });

    const targetRecipient =
      req.user.id === project.client.toString()
        ? project.assignedFreelancer
        : project.client;

    if (targetRecipient) {
      await createNotification({
        recipient: targetRecipient,
        sender: req.user.id,
        type: "milestone_updated",
        title: "New Milestone Added 🎯",
        message: `${req.user.name} added milestone "${milestone.title}" to "${project.title}".`,
        link: `/projects/${project._id}/workspace`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      data: milestone,
    });
  } catch (error) {
    console.error("createMilestone error:", error);
    res.status(500).json({ success: false, message: "Failed to create milestone" });
  }
};

// GET MILESTONES FOR PROJECT
const getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access milestones for this project",
      });
    }

    const milestones = await Milestone.find({ project: projectId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error("getProjectMilestones error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch milestones" });
  }
};

// UPDATE MILESTONE STATUS
const updateMilestoneStatus = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status required ('pending', 'in-progress', 'completed')",
      });
    }

    const milestone = await Milestone.findById(milestoneId).populate("project");
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    const project = milestone.project;
    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this milestone",
      });
    }

    milestone.status = status;
    await milestone.save();

    const targetRecipient =
      req.user.id === project.client.toString()
        ? project.assignedFreelancer
        : project.client;

    if (targetRecipient) {
      await createNotification({
        recipient: targetRecipient,
        sender: req.user.id,
        type: "milestone_updated",
        title: "Milestone Updated 🎯",
        message: `Milestone "${milestone.title}" was updated to ${status.toUpperCase()} in "${project.title}".`,
        link: `/projects/${project._id}/workspace`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Milestone status updated",
      data: milestone,
    });
  } catch (error) {
    console.error("updateMilestoneStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update milestone status" });
  }
};

// DELETE MILESTONE
const deleteMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await Milestone.findById(milestoneId).populate("project");

    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    const project = milestone.project;
    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this milestone",
      });
    }

    await Milestone.findByIdAndDelete(milestoneId);

    res.status(200).json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    console.error("deleteMilestone error:", error);
    res.status(500).json({ success: false, message: "Failed to delete milestone" });
  }
};

module.exports = {
  createMilestone,
  getProjectMilestones,
  updateMilestoneStatus,
  deleteMilestone,
};
