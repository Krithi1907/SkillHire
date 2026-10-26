import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Dashboard() {

  const { user } = useAuth();

  const freelancer =
    user?.role === "freelancer";


  const [applications, setApplications] =
    useState([]);


  useEffect(() => {

    loadApplications();


    const handleStorageChange = () => {
      loadApplications();
    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

    };

  }, [user]);


  const loadApplications = () => {

    if (!user?.id) return;


    const allApplications =
      JSON.parse(
        localStorage.getItem(
          "skillhire_applications"
        ) || "[]"
      );


    const myApplications =
      allApplications.filter(
        (application) =>
          application.userId === user.id
      );


    setApplications(
      myApplications
    );

  };


  /*
    For a freelancer:
    Projects = projects you've applied to
    Applications = applications you've submitted
  */

  const projectCount =
    applications.length;


  const applicationCount =
    applications.length;


  return (

    <div className="page">


      {/* Header */}

      <section className="dashboard-header">

        <div>

          <span className="eyebrow">
            Your workspace
          </span>

          <h1>
            Good to see you,
            {" "}
            {user?.name || "there"}.
          </h1>

          <p>
            Here's a quick look at where
            things stand.
          </p>

        </div>


        {freelancer ? (

          <Link
            className="button button-primary"
            to="/projects"
          >
            Find projects
          </Link>

        ) : (

          <Link
            className="button button-primary"
            to="/post-project"
          >
            Post a project
          </Link>

        )}

      </section>


      {/* Stats */}

      <div className="stats-grid">


        <div className="stat-card">

          <span>
            Role
          </span>

          <strong>
            {freelancer
              ? "Freelancer"
              : "Client"}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Projects
          </span>

          <strong>
            {projectCount}
          </strong>

          <small>

            {projectCount === 0
              ? "No projects yet"
              : `${projectCount} project${
                  projectCount > 1
                    ? "s"
                    : ""
                } applied to`}

          </small>

        </div>


        <div className="stat-card">

          <span>
            Applications
          </span>

          <strong>
            {applicationCount}
          </strong>

          <small>

            {applicationCount === 0
              ? "Nothing submitted yet"
              : `${applicationCount} application${
                  applicationCount > 1
                    ? "s"
                    : ""
                } submitted`}

          </small>

        </div>


      </div>


      {/* Main dashboard cards */}

      <div className="dashboard-grid">


        <div className="panel">

          <span className="eyebrow">
            Next step
          </span>

          <h2>

            {freelancer
              ? "Find something worth building."
              : "Turn your idea into a project."}

          </h2>

          <p>

            {freelancer
              ? "Browse available opportunities and discover projects that fit your skills."
              : "Describe your project, set a budget and connect with freelancers."}

          </p>


          <Link
            className="text-link"
            to={
              freelancer
                ? "/projects"
                : "/post-project"
            }
          >

            {freelancer
              ? "Browse projects →"
              : "Create a project →"}

          </Link>

        </div>


        <div className="panel">

          <span className="eyebrow">
            Profile
          </span>

          <h2>
            Make your profile feel like you.
          </h2>

          <p>
            Add your skills, headline,
            location and a short introduction.
          </p>

          <Link
            className="text-link"
            to="/profile"
          >
            Edit my profile →
          </Link>

        </div>


      </div>


      {/* Applications */}

      {freelancer && (

        <section className="application-panel">

          <div className="section-mini-heading">

            <div>

              <span className="eyebrow">
                My applications
              </span>

              <h2>
                Applications you've sent
              </h2>

            </div>


            <Link
              className="text-link"
              to="/projects"
            >
              Find more projects →
            </Link>

          </div>


          {applications.length === 0 ? (

            <div className="empty-application">

              <p>
                You haven't applied to a
                project yet.
              </p>

              <Link
                className="button button-primary"
                to="/projects"
              >
                Explore projects
              </Link>

            </div>

          ) : (

            <div className="application-list">

              {applications.map(
                (application) => (

                  <div
                    className="application-row"
                    key={application.id}
                  >

                    <div>

                      <strong>
                        {application.projectTitle}
                      </strong>

                      <span>
                        Applied recently
                      </span>

                    </div>


                    <span className="status-badge success">

                      {application.status}

                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      )}

    </div>

  );
}