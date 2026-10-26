const Message = require("../models/Message");
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

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;

    if (!projectId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project ID and message content are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this project",
      });
    }

    // Determine receiver
    const isSenderClient = project.client.toString() === req.user.id;
    const receiverId = isSenderClient
      ? project.assignedFreelancer || project.selectedFreelancer
      : project.client;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Cannot message on an open project with no assigned freelancer yet",
      });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user.id,
      receiver: receiverId,
      content: content.trim(),
      read: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    // Notify receiver
    await createNotification({
      recipient: receiverId,
      sender: req.user.id,
      type: "new_message",
      title: "New Message Received 💬",
      message: `${req.user.name}: "${content.length > 50 ? content.substring(0, 50) + "..." : content}"`,
      link: `/projects/${project._id}/workspace?tab=chat`,
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// GET MESSAGES FOR A PROJECT
const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access messages for this project",
      });
    }

    const messages = await Message.find({ project: projectId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    // Mark messages sent to this user as read
    await Message.updateMany(
      { project: projectId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("getProjectMessages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// GET ALL ACTIVE CONVERSATIONS FOR USER
const getMyConversations = async (req, res) => {
  try {
    // Find all projects where user is client or assigned freelancer
    const projects = await Project.find({
      $or: [
        { client: req.user.id },
        { assignedFreelancer: req.user.id },
        { selectedFreelancer: req.user.id },
      ],
      status: { $in: ["in-progress", "completed"] },
    })
      .populate("client", "name email")
      .populate("assignedFreelancer", "name email")
      .populate("selectedFreelancer", "name email");

    const conversations = await Promise.all(
      projects.map(async (project) => {
        const lastMessage = await Message.findOne({ project: project._id })
          .populate("sender", "name")
          .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          project: project._id,
          receiver: req.user.id,
          read: false,
        });

        const counterpart =
          project.client._id.toString() === req.user.id
            ? project.assignedFreelancer || project.selectedFreelancer
            : project.client;

        return {
          project: {
            _id: project._id,
            title: project.title,
            status: project.status,
          },
          counterpart,
          lastMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversations.filter((c) => c.counterpart),
    });
  } catch (error) {
    console.error("getMyConversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

module.exports = {
  sendMessage,
  getProjectMessages,
  getMyConversations,
};
