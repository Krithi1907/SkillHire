const Proposal = require("../models/Proposal");
const Project = require("../models/Project");
const Profile = require("../models/Profile");
const { createNotification } = require("../utils/notify");

// SUBMIT PROPOSAL (FREELANCER ONLY)
const submitProposal = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({
        success: false,
        message: "Only freelancers can submit proposals",
      });
    }

    const { projectId, bidAmount, deliveryTime, coverLetter } = req.body;

    if (!projectId || !bidAmount || !deliveryTime || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "Project ID, bid amount, delivery time, and cover letter are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This project is no longer accepting proposals",
      });
    }

    // Check if freelancer already applied
    const existingProposal = await Proposal.findOne({
      project: projectId,
      freelancer: req.user.id,
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal for this project",
      });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user.id,
      bidAmount: Number(bidAmount),
      deliveryTime: deliveryTime.trim(),
      coverLetter: coverLetter.trim(),
      status: "pending",
    });

    // Increment proposal count on project
    await Project.findByIdAndUpdate(projectId, { $inc: { proposalsCount: 1 } });

    // Notify project client
    await createNotification({
      recipient: project.client,
      sender: req.user.id,
      type: "proposal_received",
      title: "New Proposal Received! 📩",
      message: `${req.user.name} submitted a proposal of $${bidAmount} for "${project.title}".`,
      link: `/projects/${project._id}/proposals`,
    });

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      data: proposal,
    });
  } catch (error) {
    console.error("submitProposal error:", error);
    res.status(500).json({ success: false, message: "Failed to submit proposal" });
  }
};

// GET PROPOSALS FOR A PROJECT (CLIENT OWNER OR ADMIN)
const getProposalsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Only project client or admin can view all proposals
    if (project.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view proposals for this project",
      });
    }

    const proposals = await Proposal.find({ project: projectId })
      .populate("freelancer", "name email createdAt")
      .sort({ createdAt: -1 });

    // Enhance proposals with freelancer profile info (ratings, skills, etc.)
    const enhancedProposals = await Promise.all(
      proposals.map(async (p) => {
        const profile = await Profile.findOne({ user: p.freelancer._id });
        return {
          ...p.toObject(),
          freelancerProfile: profile || {},
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedProposals.length,
      data: enhancedProposals,
    });
  } catch (error) {
    console.error("getProposalsForProject error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch proposals" });
  }
};

// GET MY SUBMITTED PROPOSALS (FREELANCER)
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate({
        path: "project",
        populate: { path: "client", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    console.error("getMyProposals error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your proposals" });
  }
};

// ACCEPT PROPOSAL & HIRE FREELANCER (HIRING WORKFLOW)
const acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate("project").populate("freelancer", "name email");

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    const project = await Project.findById(proposal.project._id);

    // Verify requesting user is the project owner
    if (project.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can accept proposals",
      });
    }

    if (project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This project is already in progress or completed",
      });
    }

    // 1. Mark this proposal as accepted
    proposal.status = "accepted";
    await proposal.save();

    // 2. Mark all other pending proposals for this project as rejected
    await Proposal.updateMany(
      {
        project: project._id,
        _id: { $ne: proposal._id },
        status: "pending",
      },
      { status: "rejected" }
    );

    // 3. Update project status to 'in-progress' and assign freelancer
    project.status = "in-progress";
    project.assignedFreelancer = proposal.freelancer._id;
    project.selectedFreelancer = proposal.freelancer._id;
    await project.save();

    // 4. Notify hired freelancer
    await createNotification({
      recipient: proposal.freelancer._id,
      sender: req.user.id,
      type: "proposal_accepted",
      title: "Proposal Accepted! You're Hired! 🥳",
      message: `Your proposal for "${project.title}" has been accepted! You can now access the project workspace.`,
      link: `/projects/${project._id}/workspace`,
    });

    // 5. Notify client about hire confirmation
    await createNotification({
      recipient: req.user.id,
      sender: proposal.freelancer._id,
      type: "freelancer_hired",
      title: "Freelancer Hired Successfully! 🤝",
      message: `You have successfully hired ${proposal.freelancer.name} for "${project.title}". Check your project workspace to manage tasks.`,
      link: `/projects/${project._id}/workspace`,
    });

    res.status(200).json({
      success: true,
      message: "Proposal accepted! Freelancer hired and project is now in progress.",
      data: {
        proposal,
        project,
      },
    });
  } catch (error) {
    console.error("acceptProposal error:", error);
    res.status(500).json({ success: false, message: "Failed to accept proposal" });
  }
};

// REJECT PROPOSAL
const rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate("project");

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    const project = await Project.findById(proposal.project._id);

    if (project.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can reject proposals",
      });
    }

    proposal.status = "rejected";
    await proposal.save();

    await createNotification({
      recipient: proposal.freelancer,
      sender: req.user.id,
      type: "proposal_rejected",
      title: "Proposal Status Update",
      message: `Your proposal for "${project.title}" was not selected. Keep exploring more projects!`,
      link: `/projects/${project._id}`,
    });

    res.status(200).json({
      success: true,
      message: "Proposal rejected",
      data: proposal,
    });
  } catch (error) {
    console.error("rejectProposal error:", error);
    res.status(500).json({ success: false, message: "Failed to reject proposal" });
  }
};

// WITHDRAW PROPOSAL (FREELANCER)
const withdrawProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Proposal not found" });
    }

    if (proposal.freelancer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to withdraw this proposal",
      });
    }

    if (proposal.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw an accepted proposal",
      });
    }

    proposal.status = "withdrawn";
    await proposal.save();

    await Project.findByIdAndUpdate(proposal.project, { $inc: { proposalsCount: -1 } });

    res.status(200).json({
      success: true,
      message: "Proposal withdrawn successfully",
      data: proposal,
    });
  } catch (error) {
    console.error("withdrawProposal error:", error);
    res.status(500).json({ success: false, message: "Failed to withdraw proposal" });
  }
};

module.exports = {
  submitProposal,
  getProposalsForProject,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
};
