const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate proposal by same freelancer on the same project
proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Proposal", proposalSchema);
