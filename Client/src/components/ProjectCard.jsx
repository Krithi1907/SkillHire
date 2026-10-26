import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <article className="project-card">

      <div className="project-card-top">

        <span className="tag">
          {project.category}
        </span>

        <span className="status-badge success">
          Open
        </span>

      </div>


      <h3>
        {project.title}
      </h3>


      <p className="project-description">

        {project.description}

      </p>


      <div className="project-meta">

        <div>

          <span className="meta-label">
            Budget
          </span>

          <strong>
            ₹{project.budget}
          </strong>

        </div>


        <div>

          <span className="meta-label">
            Client
          </span>

          <strong>
            {project.clientName}
          </strong>

        </div>

      </div>


      <div className="skill-list small-skills">

        {getSkills(project.category).map(
          (skill) => (
            <span key={skill}>
              {skill}
            </span>
          )
        )}

      </div>


      <Link
        to={`/projects/${project.id}`}
        className="card-link"
      >
        View project →
      </Link>

    </article>
  );
}


function getSkills(category) {

  const skills = {

    "Web Development": [
      "React",
      "Node.js",
      "MongoDB",
    ],

    "UI/UX Design": [
      "Figma",
      "UI Design",
      "Prototyping",
    ],

    "AI & Machine Learning": [
      "Python",
      "AI",
      "Machine Learning",
    ],

    "Frontend Development": [
      "React",
      "JavaScript",
      "CSS",
    ],

    "Full Stack Development": [
      "React",
      "Express",
      "MongoDB",
    ],

  };

  return skills[category] || [
    "Communication",
    "Problem Solving",
  ];
}