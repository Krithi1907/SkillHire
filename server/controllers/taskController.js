const Task = require("../models/Task");
const Project = require("../models/Project");
const { createNotification } = require("../utils/notify");

// Helper to check project membership
const checkProjectAccess = (project, userId, userRole) => {
  if (userRole === "admin") return true;
  const isClient = project.client.toString() === userId;
  const isFreelancer =
    (project.assignedFreelancer && project.assignedFreelancer.toString() === userId) ||
    (project.selectedFreelancer && project.selectedFreelancer.toString() === userId);
  return isClient || isFreelancer;
};

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, dueDate, assignedTo } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: "Project ID and task title are required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create tasks on this project",
      });
    }

    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description: (description || "").trim(),
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || project.assignedFreelancer || project.client,
      createdBy: req.user.id,
      status: "todo",
    });

    // Notify other party
    const targetRecipient =
      req.user.id === project.client.toString()
        ? project.assignedFreelancer
        : project.client;

    if (targetRecipient) {
      await createNotification({
        recipient: targetRecipient,
        sender: req.user.id,
        type: "task_assigned",
        title: "New Task Created 📋",
        message: `${req.user.name} added task "${task.title}" to "${project.title}".`,
        link: `/projects/${project._id}/workspace`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

// GET ALL TASKS FOR A PROJECT
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access tasks for this project",
      });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("getProjectTasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// UPDATE TASK STATUS (KANBAN DRAG / STATUS TOGGLE)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status || !["todo", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status required ('todo', 'in-progress', 'completed')",
      });
    }

    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;
    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    task.status = status;
    await task.save();

    // Notify other party
    const targetRecipient =
      req.user.id === project.client.toString()
        ? project.assignedFreelancer
        : project.client;

    if (targetRecipient) {
      await createNotification({
        recipient: targetRecipient,
        sender: req.user.id,
        type: "task_updated",
        title: "Task Status Updated 🔄",
        message: `${req.user.name} moved task "${task.title}" to ${status.toUpperCase()} in "${project.title}".`,
        link: `/projects/${project._id}/workspace`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated",
      data: task,
    });
  } catch (error) {
    console.error("updateTaskStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update task status" });
  }
};

// UPDATE TASK DETAILS
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;
    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const { title, description, priority, dueDate, assignedTo, status } = req.body;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo) task.assignedTo = assignedTo;
    if (status && ["todo", "in-progress", "completed"].includes(status)) task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate("project");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;
    if (!checkProjectAccess(project, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
