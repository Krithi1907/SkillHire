const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Web Development",
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    skills: {
      type: [String],
      required: true,
      default: [],
    },

    deadline: {
      type: Date,
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
    },

    selectedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attachments: [
      {
        name: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    proposalsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Keep assignedFreelancer and selectedFreelancer synchronized
projectSchema.pre("save", function () {
  if (this.assignedFreelancer && !this.selectedFreelancer) {
    this.selectedFreelancer = this.assignedFreelancer;
  } else if (this.selectedFreelancer && !this.assignedFreelancer) {
    this.assignedFreelancer = this.selectedFreelancer;
  }
});

module.exports = mongoose.model("Project", projectSchema);