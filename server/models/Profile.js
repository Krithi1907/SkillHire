const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },

    // Freelancer specific fields
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        duration: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: String, default: "" },
      },
    ],
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        projectUrl: { type: String, default: "" },
        image: { type: String, default: "" },
        technologies: { type: [String], default: [] },
      },
    ],
    availability: {
      type: String,
      enum: ["Available", "Part-Time", "Busy", "Not Available"],
      default: "Available",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Client specific fields
    company: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual alias for avatar
profileSchema.virtual("avatar").get(function () {
  return this.profilePhoto;
});

module.exports = mongoose.model("Profile", profileSchema);
