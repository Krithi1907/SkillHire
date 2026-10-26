const Review = require("../models/Review");
const Project = require("../models/Project");
const Profile = require("../models/Profile");
const { createNotification } = require("../utils/notify");

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const { projectId, rating, comment } = req.body;

    if (!projectId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Project ID, rating (1-5), and comment are required",
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Reviews can only be submitted once the project is marked as Completed",
      });
    }

    // Determine who is being reviewed
    const isClient = project.client.toString() === req.user.id;
    const isFreelancer =
      (project.assignedFreelancer && project.assignedFreelancer.toString() === req.user.id) ||
      (project.selectedFreelancer && project.selectedFreelancer.toString() === req.user.id);

    if (!isClient && !isFreelancer) {
      return res.status(403).json({
        success: false,
        message: "Only client and assigned freelancer of this project can submit reviews",
      });
    }

    const revieweeId = isClient
      ? project.assignedFreelancer || project.selectedFreelancer
      : project.client;

    if (!revieweeId) {
      return res.status(400).json({
        success: false,
        message: "No assigned participant to review",
      });
    }

    // Check if user has already reviewed this project
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this project",
      });
    }

    const review = await Review.create({
      project: projectId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating: numRating,
      comment: comment.trim(),
    });

    // Recalculate average rating for reviewee
    const allUserReviews = await Review.find({ reviewee: revieweeId });
    const totalScore = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalScore / allUserReviews.length).toFixed(1));

    await Profile.findOneAndUpdate(
      { user: revieweeId },
      {
        rating: averageRating,
        reviewCount: allUserReviews.length,
      },
      { upsert: true }
    );

    // Notify reviewee
    await createNotification({
      recipient: revieweeId,
      sender: req.user.id,
      type: "review_received",
      title: "New Review Received! ⭐",
      message: `${req.user.name} gave you a ${numRating}-star review for "${project.title}".`,
      link: `/profile/${revieweeId}`,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};

// GET REVIEWS FOR A USER
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name role")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("getUserReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// GET REVIEWS FOR A PROJECT
const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reviews = await Review.find({ project: projectId })
      .populate("reviewer", "name role")
      .populate("reviewee", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("getProjectReviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project reviews" });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getProjectReviews,
};
