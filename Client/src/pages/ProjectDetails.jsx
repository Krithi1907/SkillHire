import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const projects = [
  {
    id: "project-1",
    title: "Campus Event Management Platform",
    category: "Web Development",
    description:
      "Build a responsive platform for managing college events, registrations, student participation and event communication.",
    budget: "25,000",
    timeline: "3–5 weeks",
    client: "Campus Innovations",
    skills: ["React", "Node.js", "MongoDB"],
  },

  {
    id: "project-2",
    title: "Mobile Fitness Tracker UI",
    category: "UI/UX Design",
    description:
      "Design a clean and friendly mobile fitness tracking experience with dashboards, activity tracking and progress views.",
    budget: "15,000",
    timeline: "2–3 weeks",
    client: "FitLife Startup",
    skills: ["Figma", "UI Design", "Prototyping"],
  },

  {
    id: "project-3",
    title: "AI Resume Analyzer",
    category: "AI & Machine Learning",
    description:
      "Create a web application that analyzes resumes and provides useful suggestions to improve skills, structure and job compatibility.",
    budget: "35,000",
    timeline: "4–6 weeks",
    client: "CareerTech Labs",
    skills: ["Python", "AI", "Machine Learning"],
  },

  {
    id: "project-4",
    title: "Local Business Portfolio Website",
    category: "Frontend Development",
    description:
      "Develop a modern responsive website for a growing local business to showcase services, testimonials and contact information.",
    budget: "12,000",
    timeline: "2–3 weeks",
    client: "Urban Spaces",
    skills: ["React", "JavaScript", "CSS"],
  },

  {
    id: "project-5",
    title: "Online Learning Dashboard",
    category: "Full Stack Development",
    description:
      "Build an intuitive learning dashboard where students can track courses, assignments, progress and upcoming deadlines.",
    budget: "30,000",
    timeline: "4–5 weeks",
    client: "LearnBridge",
    skills: ["React", "Express", "MongoDB"],
  },
];


export default function ProjectDetails() {

  const { id } = useParams();

  const { user } = useAuth();

  const [applied, setApplied] = useState(false);


  const project =
    projects.find(
      (item) => item.id === id
    ) || projects[0];


  useEffect(() => {

    if (!user?.id) return;


    const applications =
      JSON.parse(
        localStorage.getItem(
          "skillhire_applications"
        ) || "[]"
      );


    const alreadyApplied =
      applications.some(
        (application) =>
          application.userId === user.id &&
          application.projectId === project.id
      );


    setApplied(alreadyApplied);

  }, [user, project.id]);


  const handleApply = () => {

    if (!user) {

      window.location.href =
        "/login";

      return;

    }


    if (applied) return;


    const applications =
      JSON.parse(
        localStorage.getItem(
          "skillhire_applications"
        ) || "[]"
      );


    const newApplication = {

      id:
        `${user.id}-${project.id}`,

      userId:
        user.id,

      userName:
        user.name,

      projectId:
        project.id,

      projectTitle:
        project.title,

      status:
        "Pending",

      appliedAt:
        new Date().toISOString(),

    };


    localStorage.setItem(

      "skillhire_applications",

      JSON.stringify([
        ...applications,
        newApplication,
      ])

    );


    setApplied(true);

  };


  return (

    <div className="page narrow-page">

      <Link
        className="back-link"
        to="/projects"
      >
        ← Back to projects
      </Link>


      <article className="detail-card">


        <div className="project-card-top">

          <span className="tag">
            {project.category}
          </span>


          <span
            className={
              applied
                ? "status-badge success"
                : "status-badge"
            }
          >

            {applied
              ? "Application sent"
              : "Open"}

          </span>

        </div>


        <h1>
          {project.title}
        </h1>


        <p className="detail-lead">
          {project.description}
        </p>


        <div className="detail-stats">

          <div>

            <span>
              Budget
            </span>

            <strong>
              ₹{project.budget}
            </strong>

          </div>


          <div>

            <span>
              Timeline
            </span>

            <strong>
              {project.timeline}
            </strong>

          </div>


          <div>

            <span>
              Client
            </span>

            <strong>
              {project.client}
            </strong>

          </div>

        </div>


        <hr />


        <h2>
          About this project
        </h2>


        <p>
          {project.description}
          {" "}
          The client is looking for someone
          who can bring the idea to life with
          a reliable and thoughtful approach.
        </p>


        <h3 className="skills-heading">
          Skills needed
        </h3>


        <div className="skill-list">

          {project.skills.map(
            (skill) => (

              <span key={skill}>
                {skill}
              </span>

            )
          )}

        </div>


        {applied && (

          <div className="application-success">

            <strong>
              ✓ Application submitted
            </strong>

            <span>

              Your application for
              <b> {project.title}</b>
              {" "}
              is now marked as
              <b> Pending</b>.

            </span>

          </div>

        )}


        <button

          className={
            applied
              ? "button button-applied button-large"
              : "button button-primary button-large"
          }

          onClick={handleApply}

          disabled={applied}

        >

          {applied
            ? "✓ Applied for this project"
            : "Apply for project"}

        </button>


      </article>

    </div>

  );
}