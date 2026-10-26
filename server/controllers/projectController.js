const Project = require("../models/Project");
const Proposal = require("../models/Proposal");
const { createNotification } = require("../utils/notify");

// CREATE NEW PROJECT (CLIENT ONLY)
const createProject = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create projects",
      });
    }

    const { title, description, budget, skills, deadline, category, attachments } = req.body;

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, description, budget, and deadline are required",
      });
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      skills: parsedSkills,
      deadline: new Date(deadline),
      category: category || "Web Development",
      attachments: attachments || [],
      client: req.user.id,
      status: "open",
    });

    await createNotification({
      recipient: req.user.id,
      type: "system",
      title: "Project Published! 🚀",
      message: `Your project "${project.title}" has been published and is now open for proposals.`,
      link: `/projects/${project._id}`,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("createProject error:", error);
    res.status(500).json({ success: false, message: "Failed to create project" });
  }
};

// GET ALL PROJECTS (MARKETPLACE SEARCH & FILTER)
const getAllProjects = async (req, res) => {
  try {
    const {
      search,
      category,
      skill,
      minBudget,
      maxBudget,
      status,
      sort = "newest",
    } = req.query;

    const query = {};

    // Filter by status (default to open if not specified, or allow "all")
    if (status && status !== "all") {
      query.status = status;
    } else if (!status) {
      query.status = "open";
    }

    if (category && category !== "All Categories") {
      query.category = category;
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skills: searchRegex },
        { category: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "budget_high") sortOption = { budget: -1 };
    else if (sort === "budget_low") sortOption = { budget: 1 };
    else if (sort === "deadline") sortOption = { deadline: 1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const projects = await Project.find(query)
      .populate("client", "name email")
      .populate("assignedFreelancer", "name email")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("getAllProjects error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// GET PROJECT BY ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("client", "name email createdAt")
      .populate("assignedFreelancer", "name email createdAt")
      .populate("selectedFreelancer", "name email createdAt");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if authenticated user has submitted a proposal for this project
    let hasApplied = false;
    let userProposal = null;
    if (req.user && req.user.role === "freelancer") {
      userProposal = await Proposal.findOne({
        project: project._id,
        freelancer: req.user.id,
      });
      hasApplied = Boolean(userProposal);
    }

    // Refresh proposals count
    const proposalsCount = await Proposal.countDocuments({ project: project._id });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        proposalsCount,
        hasApplied,
        userProposal,
      },
    });
  } catch (error) {
    console.error("getProjectById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project details" });
  }
};

// GET CLIENT'S POSTED PROJECTS
const getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id })
      .populate("assignedFreelancer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("getClientProjects error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client projects" });
  }
};

// GET FREELANCER'S ASSIGNED PROJECTS
const getFreelancerProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { assignedFreelancer: req.user.id },
        { selectedFreelancer: req.user.id },
      ],
    })
      .populate("client", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("getFreelancerProjects error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assigned projects" });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only client owner or admin can edit
    if (project.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project",
      });
    }

    const { title, description, budget, skills, deadline, category, status } = req.body;

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (budget !== undefined) project.budget = Number(budget);
    if (deadline) project.deadline = new Date(deadline);
    if (category) project.category = category;
    if (skills) {
      project.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (status && ["open", "in-progress", "completed", "cancelled"].includes(status)) {
      project.status = status;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("updateProject error:", error);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only client owner or admin can delete
    if (project.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this project",
      });
    }

    // Only allow delete if project is open or cancelled
    if (project.status === "in-progress" && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a project that is currently in progress",
      });
    }

    await Project.findByIdAndDelete(id);

    // Also delete associated proposals
    await Proposal.deleteMany({ project: id });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("deleteProject error:", error);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
};

// MARK PROJECT COMPLETED
const completeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only client owner or assigned freelancer or admin can complete
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer =
      (project.assignedFreelancer && project.assignedFreelancer.toString() === req.user.id) ||
      (project.selectedFreelancer && project.selectedFreelancer.toString() === req.user.id);

    if (!isClient && !isFreelancer && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this project",
      });
    }

    project.status = "completed";
    await project.save();

    // Send notifications to both client and freelancer
    if (project.assignedFreelancer) {
      await createNotification({
        recipient: project.assignedFreelancer,
        sender: req.user.id,
        type: "project_completed",
        title: "Project Completed! 🏆",
        message: `Project "${project.title}" has been marked as Completed. Leave a review for the client!`,
        link: `/projects/${project._id}/workspace`,
      });
    }

    await createNotification({
      recipient: project.client,
      sender: req.user.id,
      type: "project_completed",
      title: "Project Completed! 🏆",
      message: `Project "${project.title}" is officially complete. You can now leave a review for the freelancer!`,
      link: `/projects/${project._id}/workspace`,
    });

    res.status(200).json({
      success: true,
      message: "Project marked as completed successfully",
      data: project,
    });
  } catch (error) {
    console.error("completeProject error:", error);
    res.status(500).json({ success: false, message: "Failed to complete project" });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getClientProjects,
  getFreelancerProjects,
  updateProject,
  deleteProject,
  completeProject,
};
