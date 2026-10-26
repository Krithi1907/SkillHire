require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Profile = require("./models/Profile");
const Project = require("./models/Project");
const Proposal = require("./models/Proposal");
const Task = require("./models/Task");
const Milestone = require("./models/Milestone");
const Message = require("./models/Message");
const Notification = require("./models/Notification");
const Review = require("./models/Review");
const Report = require("./models/Report");

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log("Connected to MongoDB!");

    // Clean existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Project.deleteMany({}),
      Proposal.deleteMany({}),
      Task.deleteMany({}),
      Milestone.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminHashedPassword = await bcrypt.hash("admin123", 10);

    console.log("Creating users...");
    // 1. Admin
    const admin = await User.create({
      name: "Platform Administrator",
      email: "admin@skillhire.com",
      password: adminHashedPassword,
      role: "admin",
      isActive: true,
    });

    // 2. Clients
    const client1 = await User.create({
      name: "Sarah Jenkins",
      email: "sarah@acmedigital.com",
      password: hashedPassword,
      role: "client",
      isActive: true,
    });

    const client2 = await User.create({
      name: "Marcus Vance",
      email: "marcus@techstart.io",
      password: hashedPassword,
      role: "client",
      isActive: true,
    });

    // 3. Freelancers
    const freelancer1 = await User.create({
      name: "Alex Rivera",
      email: "alex.rivera@gmail.com",
      password: hashedPassword,
      role: "freelancer",
      isActive: true,
    });

    const freelancer2 = await User.create({
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      password: hashedPassword,
      role: "freelancer",
      isActive: true,
    });

    const freelancer3 = await User.create({
      name: "David Chen",
      email: "david.chen@gmail.com",
      password: hashedPassword,
      role: "freelancer",
      isActive: true,
    });

    console.log("Creating profiles...");
    // Profiles
    const adminProfile = await Profile.create({
      user: admin._id,
      role: "admin",
      bio: "SkillHire System Administrator & Safety Team",
      location: "San Francisco, CA",
    });

    const client1Profile = await Profile.create({
      user: client1._id,
      role: "client",
      bio: "Founder & Product Lead at Acme Digital. We build intuitive consumer web applications.",
      company: "Acme Digital Innovations",
      website: "https://acmedigital.example.com",
      industry: "Information Technology",
      location: "Austin, TX",
      profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    });

    const client2Profile = await Profile.create({
      user: client2._id,
      role: "client",
      bio: "Managing Director at TechStart Ventures. Sourcing high-impact engineering talent.",
      company: "TechStart Labs",
      website: "https://techstart.example.io",
      industry: "Fintech & SaaS",
      location: "New York, NY",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    });

    const freelancer1Profile = await Profile.create({
      user: freelancer1._id,
      role: "freelancer",
      bio: "Senior Full-Stack MERN & Cloud Architect with 6+ years of building resilient, scalable web apps.",
      location: "Seattle, WA",
      skills: ["React", "Node.js", "Express", "MongoDB", "TypeScript", "Tailwind CSS", "AWS", "Docker"],
      hourlyRate: 65,
      availability: "Available",
      rating: 4.9,
      reviewCount: 14,
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      experience: [
        {
          title: "Senior Full-Stack Engineer",
          company: "CloudScale Systems",
          duration: "2021 - Present",
          description: "Architected high-throughput microservices and responsive React web platforms.",
        },
        {
          title: "Frontend Developer",
          company: "PixelWorks Interactive",
          duration: "2019 - 2021",
          description: "Built component libraries and high-performance interactive SPAs.",
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science",
          institution: "University of Washington",
          year: "2019",
        },
      ],
      portfolio: [
        {
          title: "OmniCart e-Commerce Platform",
          description: "High-performance headless marketplace with Stripe integration and instant search.",
          projectUrl: "https://omnicart.example.com",
          image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&auto=format&fit=crop&q=80",
          technologies: ["React", "Node.js", "MongoDB", "Redis"],
        },
        {
          title: "FlowPulse Analytics Dashboard",
          description: "Real-time metrics streaming dashboard with live SVG chart visualizations.",
          projectUrl: "https://flowpulse.example.com",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80",
          technologies: ["React", "Express", "Chart.js"],
        },
      ],
    });

    const freelancer2Profile = await Profile.create({
      user: freelancer2._id,
      role: "freelancer",
      bio: "Passionate UI/UX Designer & Frontend React Developer. Obsessed with clean aesthetics and humanized user experiences.",
      location: "Toronto, Canada",
      skills: ["Figma", "UI/UX Design", "React", "Tailwind CSS", "Next.js", "Accessibility (a11y)"],
      hourlyRate: 55,
      availability: "Available",
      rating: 4.8,
      reviewCount: 9,
      profilePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      experience: [
        {
          title: "Lead UI Engineer",
          company: "Studio Craft",
          duration: "2022 - Present",
          description: "Designed design systems and turned Figma tokens into pixel-perfect React components.",
        },
      ],
      education: [
        {
          degree: "B.Des in Interaction Design",
          institution: "OCAD University",
          year: "2021",
        },
      ],
      portfolio: [
        {
          title: "Aura Health & Mindfulness App",
          description: "Mobile and responsive web app focused on peaceful interaction states and micro-animations.",
          projectUrl: "https://aura.example.com",
          image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80",
          technologies: ["Figma", "React", "CSS Variables"],
        },
      ],
    });

    const freelancer3Profile = await Profile.create({
      user: freelancer3._id,
      role: "freelancer",
      bio: "Backend specialist focused on high performance REST & GraphQL APIs, secure authentication, and databases.",
      location: "San Jose, CA",
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "REST APIs", "Docker"],
      hourlyRate: 60,
      availability: "Part-Time",
      rating: 4.7,
      reviewCount: 8,
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    });

    // Link profiles to users
    await User.findByIdAndUpdate(admin._id, { profile: adminProfile._id });
    await User.findByIdAndUpdate(client1._id, { profile: client1Profile._id });
    await User.findByIdAndUpdate(client2._id, { profile: client2Profile._id });
    await User.findByIdAndUpdate(freelancer1._id, { profile: freelancer1Profile._id });
    await User.findByIdAndUpdate(freelancer2._id, { profile: freelancer2Profile._id });
    await User.findByIdAndUpdate(freelancer3._id, { profile: freelancer3Profile._id });

    console.log("Creating projects...");
    // Project 1: Open project with proposals
    const project1 = await Project.create({
      title: "Modern SaaS Analytics Dashboard & Billing Portal",
      description: "We are seeking a talented full-stack MERN engineer to build an interactive subscriber analytics dashboard. Features include role-based team management, subscription tier billing integration, and data visualization cards.",
      category: "Web Development",
      budget: 2500,
      skills: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks out
      client: client1._id,
      status: "open",
      proposalsCount: 2,
    });

    // Project 2: In-Progress project with Alex Rivera hired!
    const project2 = await Project.create({
      title: "Interactive E-Commerce Checkout Redesign & Payment Gateway",
      description: "Revamp our checkout conversion flow with multi-step validation, address auto-complete, and seamless payment processing. Need clean, reusable components and robust test coverage.",
      category: "Web Development",
      budget: 1800,
      skills: ["React", "JavaScript", "REST APIs", "Node.js"],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks out
      client: client1._id,
      status: "in-progress",
      assignedFreelancer: freelancer1._id,
      selectedFreelancer: freelancer1._id,
      proposalsCount: 1,
    });

    // Project 3: Completed project with reviews
    const project3 = await Project.create({
      title: "FinTech Mobile-First Banking Landing Page & Calculator",
      description: "Design and implement a responsive landing page with an interactive loan repayment calculator, currency converter, and security compliance badges.",
      category: "Design & Creative",
      budget: 1200,
      skills: ["UI/UX Design", "React", "Figma", "CSS"],
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // completed 5 days ago
      client: client2._id,
      status: "completed",
      assignedFreelancer: freelancer2._id,
      selectedFreelancer: freelancer2._id,
      proposalsCount: 1,
    });

    // Project 4: Open project by Marcus
    const project4 = await Project.create({
      title: "High-Throughput Node.js Notification Microservice",
      description: "Build an event-driven notification dispatch service with support for email templates, in-app notifications, and webhook retry policies.",
      category: "Backend Development",
      budget: 3200,
      skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      client: client2._id,
      status: "open",
      proposalsCount: 1,
    });

    console.log("Creating proposals...");
    // Proposals for Project 1 (Open)
    await Proposal.create({
      project: project1._id,
      freelancer: freelancer1._id,
      bidAmount: 2400,
      deliveryTime: "18 days",
      coverLetter: "Hi Sarah! I have built multiple enterprise dashboards in React and Node.js with complex data aggregation. I would love to collaborate on this and can provide immediate availability.",
      status: "pending",
    });

    await Proposal.create({
      project: project1._id,
      freelancer: freelancer2._id,
      bidAmount: 2200,
      deliveryTime: "20 days",
      coverLetter: "Hello Acme team! My focus is on creating humanized, exceptionally clean interfaces that reduce friction. I can deliver both the UI design tokens and complete React component system.",
      status: "pending",
    });

    // Proposal for Project 2 (Accepted)
    await Proposal.create({
      project: project2._id,
      freelancer: freelancer1._id,
      bidAmount: 1800,
      deliveryTime: "14 days",
      coverLetter: "I've optimized checkout funnels for over 5 commercial brands, lifting checkout completion by 23%. Ready to hit the ground running with modular React state.",
      status: "accepted",
    });

    // Proposal for Project 3 (Accepted & Completed)
    await Proposal.create({
      project: project3._id,
      freelancer: freelancer2._id,
      bidAmount: 1200,
      deliveryTime: "10 days",
      coverLetter: "Fintech interfaces need to balance visual trust and rapid usability. I would love to craft this for TechStart Labs!",
      status: "accepted",
    });

    // Proposal for Project 4 (Pending)
    await Proposal.create({
      project: project4._id,
      freelancer: freelancer3._id,
      bidAmount: 3000,
      deliveryTime: "25 days",
      coverLetter: "Node.js architecture and queuing systems are my core daily specialty. I can implement clean worker patterns with MongoDB change streams and reliable delivery.",
      status: "pending",
    });

    console.log("Creating tasks for in-progress project...");
    // Tasks for Project 2 (Workspace Kanban)
    await Task.create({
      project: project2._id,
      title: "Audit current checkout abandonment points",
      description: "Analyze user drop-off stages and document friction in current form layout.",
      priority: "high",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedTo: freelancer1._id,
      createdBy: client1._id,
      status: "completed",
    });

    await Task.create({
      project: project2._id,
      title: "Implement address autocomplete & card validation",
      description: "Create responsive credit card input mask and Google Places / postal lookup integration.",
      priority: "high",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      assignedTo: freelancer1._id,
      createdBy: freelancer1._id,
      status: "in-progress",
    });

    await Task.create({
      project: project2._id,
      title: "Set up unit tests & error boundary handling",
      description: "Ensure network retry logic triggers cleanly when card processing fails.",
      priority: "medium",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assignedTo: freelancer1._id,
      createdBy: client1._id,
      status: "todo",
    });

    console.log("Creating milestones...");
    await Milestone.create({
      project: project2._id,
      title: "Phase 1: Wireframes & Form Architecture",
      description: "Deliver wireframes and prototype state flow for checkout form.",
      amount: 600,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "completed",
    });

    await Milestone.create({
      project: project2._id,
      title: "Phase 2: Component Integration & Validation",
      description: "Complete React components with form field validation and error states.",
      amount: 700,
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: "in-progress",
    });

    await Milestone.create({
      project: project2._id,
      title: "Phase 3: Final Testing & Deployment",
      description: "End-to-end testing, documentation, and handoff.",
      amount: 500,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "pending",
    });

    console.log("Creating messages...");
    await Message.create({
      project: project2._id,
      sender: client1._id,
      receiver: freelancer1._id,
      content: "Hi Alex! Super excited to have you on board for the checkout redesign. Let me know when you've reviewed the wireframe brief.",
      read: true,
    });

    await Message.create({
      project: project2._id,
      sender: freelancer1._id,
      receiver: client1._id,
      content: "Thanks Sarah! The brief looks crystal clear. I've finished the audit task and started building the validation components today!",
      read: true,
    });

    await Message.create({
      project: project2._id,
      sender: client1._id,
      receiver: freelancer1._id,
      content: "Awesome progress! Looking forward to testing the validation flow later this week.",
      read: false,
    });

    console.log("Creating reviews for completed project...");
    // Client reviews Freelancer
    await Review.create({
      project: project3._id,
      reviewer: client2._id,
      reviewee: freelancer2._id,
      rating: 5,
      comment: "Priya delivered beyond expectations! The landing page is gorgeous, blazingly fast, and user feedback has been glowing. Will definitely hire again.",
    });

    // Freelancer reviews Client
    await Review.create({
      project: project3._id,
      reviewer: freelancer2._id,
      reviewee: client2._id,
      rating: 5,
      comment: "Marcus was an absolute pleasure to collaborate with. Prompt feedback, clear specifications, and very respectful of deadlines.",
    });

    console.log("Creating sample platform reports for admin moderation...");
    await Report.create({
      reportedBy: client1._id,
      targetType: "user",
      targetId: freelancer3._id.toString(),
      reason: "Suspected duplicate profile inquiry",
      description: "Inquiry asking to conduct payment outside of platform.",
      status: "pending",
    });

    console.log("Creating sample notifications...");
    await Notification.create({
      recipient: freelancer1._id,
      sender: client1._id,
      type: "proposal_accepted",
      title: "Proposal Accepted! You're Hired! 🥳",
      message: `Your proposal for "${project2.title}" has been accepted! You can now access the project workspace.`,
      link: `/projects/${project2._id}/workspace`,
      read: false,
    });

    await Notification.create({
      recipient: client1._id,
      sender: freelancer1._id,
      type: "proposal_received",
      title: "New Proposal Received! 📩",
      message: `Alex Rivera submitted a proposal for "${project1.title}".`,
      link: `/projects/${project1._id}/proposals`,
      read: false,
    });

    console.log("\n=============================================");
    console.log(" SkillHire Database Seeded Successfully! 🎉 ");
    console.log("=============================================");
    console.log("\nDemo Credentials:");
    console.log("1. Admin:      admin@skillhire.com      / admin123");
    console.log("2. Client 1:   sarah@acmedigital.com    / password123");
    console.log("3. Client 2:   marcus@techstart.io      / password123");
    console.log("4. Freelancer: alex.rivera@gmail.com    / password123");
    console.log("5. Freelancer: priya.sharma@gmail.com   / password123");
    console.log("6. Freelancer: david.chen@gmail.com     / password123");
    console.log("=============================================\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
