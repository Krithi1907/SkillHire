import { useState } from "react";
import ProjectCard from "../components/ProjectCard";

const demoProjects = [
  {
    id: "project-1",
    title: "Campus Event Management Platform",
    description:
      "Build a responsive platform for managing college events, registrations, student participation and event communication.",
    category: "Web Development",
    budget: "25,000",
    clientName: "Campus Innovations",
  },

  {
    id: "project-2",
    title: "Mobile Fitness Tracker UI",
    description:
      "Design a clean and friendly mobile fitness tracking experience with dashboards, activity tracking and progress views.",
    category: "UI/UX Design",
    budget: "15,000",
    clientName: "FitLife Startup",
  },

  {
    id: "project-3",
    title: "AI Resume Analyzer",
    description:
      "Create a web application that analyzes resumes and provides useful suggestions to improve skills, structure and job compatibility.",
    category: "AI & Machine Learning",
    budget: "35,000",
    clientName: "CareerTech Labs",
  },

  {
    id: "project-4",
    title: "Local Business Portfolio Website",
    description:
      "Develop a modern responsive website for a growing local business to showcase services, testimonials and contact information.",
    category: "Frontend Development",
    budget: "12,000",
    clientName: "Urban Spaces",
  },

  {
    id: "project-5",
    title: "Online Learning Dashboard",
    description:
      "Build an intuitive learning dashboard where students can track courses, assignments, progress and upcoming deadlines.",
    category: "Full Stack Development",
    budget: "30,000",
    clientName: "LearnBridge",
  },
];

export default function Projects() {
  const [query, setQuery] = useState("");

  const filteredProjects = demoProjects.filter((project) =>
    `${project.title} ${project.description} ${project.category} ${project.clientName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="page">

      {/* Heading */}

      <section className="page-heading">

        <span className="eyebrow">
          Explore opportunities
        </span>

        <h1>
          Projects looking for people like you.
        </h1>

        <p>
          Discover projects where your skills can make
          a real difference.
        </p>

      </section>


      {/* Search */}

      <div className="search-bar">

        <span>⌕</span>

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search projects, skills or categories..."
        />

      </div>


      {/* Project count */}

      <div className="project-result-header">

        <span>
          {filteredProjects.length} projects available
        </span>

      </div>


      {/* Projects */}

      {filteredProjects.length > 0 ? (

        <div className="projects-grid">

          {filteredProjects.map((project) => (

            <ProjectCard
              key={project.id}
              project={project}
            />

          ))}

        </div>

      ) : (

        <div className="empty-projects">

          <h3>
            No projects found
          </h3>

          <p>
            Try searching for another skill or category.
          </p>

        </div>

      )}

    </div>
  );
}