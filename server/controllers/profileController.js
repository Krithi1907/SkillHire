const Profile = require("../models/Profile");
const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");

// GET CURRENT USER PROFILE
const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate("user", "name email role createdAt");

    if (!profile) {
      profile = await Profile.create({
        user: req.user.id,
        role: req.user.role,
        bio: req.user.role === "freelancer" ? "Passionate professional ready for great projects." : "Looking to collaborate with talented freelancers.",
      });
      await User.findByIdAndUpdate(req.user.id, { profile: profile._id });
      profile = await Profile.findById(profile._id).populate("user", "name email role createdAt");
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
};

// UPDATE CURRENT USER PROFILE
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      profilePhoto,
      phone,
      skills,
      hourlyRate,
      experience,
      education,
      portfolio,
      availability,
      company,
      website,
      industry,
    } = req.body;

    // Optionally update user name
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new Profile({
        user: req.user.id,
        role: req.user.role,
      });
    }

    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
    if (phone !== undefined) profile.phone = phone;

    // Freelancer fields
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate) || 0;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (portfolio !== undefined) profile.portfolio = portfolio;
    if (availability !== undefined) profile.availability = availability;

    // Client fields
    if (company !== undefined) profile.company = company;
    if (website !== undefined) profile.website = website;
    if (industry !== undefined) profile.industry = industry;

    await profile.save();

    const updatedProfile = await Profile.findById(profile._id).populate("user", "name email role createdAt");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// GET PUBLIC PROFILE BY USER ID
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name email role createdAt isActive");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profile = await Profile.findOne({ user: userId }).populate("user", "name email role createdAt");
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        role: user.role,
      });
      profile = await Profile.findById(profile._id).populate("user", "name email role createdAt");
    }

    // Fetch user reviews
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name role")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    // Completed projects
    let completedProjectsCount = 0;
    if (user.role === "freelancer") {
      completedProjectsCount = await Project.countDocuments({
        $or: [{ assignedFreelancer: userId }, { selectedFreelancer: userId }],
        status: "completed",
      });
    } else if (user.role === "client") {
      completedProjectsCount = await Project.countDocuments({
        client: userId,
        status: "completed",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile,
        reviews,
        completedProjectsCount,
      },
    });
  } catch (error) {
    console.error("getProfileByUserId error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// GET ALL FREELANCERS (DIRECTORY & SEARCH)
const getAllFreelancers = async (req, res) => {
  try {
    const { search, skill, minRate, maxRate, availability, sort = "rating" } = req.query;

    const query = { role: "freelancer" };

    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (availability) {
      query.availability = availability;
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    let sortOption = {};
    if (sort === "rating") sortOption = { rating: -1, reviewCount: -1 };
    else if (sort === "rate_asc") sortOption = { hourlyRate: 1 };
    else if (sort === "rate_desc") sortOption = { hourlyRate: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    let profiles = await Profile.find(query)
      .populate({
        path: "user",
        match: { isActive: { $ne: false } },
        select: "name email role createdAt",
      })
      .sort(sortOption);

    // Filter out profiles whose user was deactivated or null
    profiles = profiles.filter((p) => p.user);

    // If search keyword provided, match name, bio, or skills
    if (search) {
      const keyword = search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(keyword) ||
          p.bio?.toLowerCase().includes(keyword) ||
          p.skills?.some((s) => s.toLowerCase().includes(keyword))
      );
    }

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    console.error("getAllFreelancers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch freelancers" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getAllFreelancers,
};
