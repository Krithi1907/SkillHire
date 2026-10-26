import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });

  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveProfile = (e) => {
    e.preventDefault();

    updateProfile({
      name: form.name,
      headline: form.headline,
      bio: form.bio,

      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),

      phone: form.phone,
      location: form.location,
    });

    setSaved(true);
  };

  return (
    <div className="page narrow-page">

      {/* Heading */}
      <section className="page-heading">

        <span className="eyebrow">
          Your profile
        </span>

        <h1>
          Let people know who you are.
        </h1>

        <p>
          Add a few details about yourself so clients and
          freelancers can understand what you bring to a project.
        </p>

      </section>


      {/* Profile summary */}
      <div className="profile-card profile-summary">

        <div className="profile-avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>

        <div>

          <h2>
            {user?.name || "SkillHire user"}
          </h2>

          <p>
            {user?.email || "No email available"}
          </p>

          <span className="tag">
            {user?.role || "member"}
          </span>

        </div>

      </div>


      {/* Editable profile */}
      <form
        className="form-card profile-form"
        onSubmit={saveProfile}
      >

        <div className="profile-form-title">

          <div>

            <span className="eyebrow">
              Personal details
            </span>

            <h2>
              Make your profile yours.
            </h2>

          </div>

        </div>


        {/* Name + Phone */}
        <div className="two-columns">

          <label>
            Full name

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              placeholder="Your name"
              required
            />

          </label>


          <label>
            Phone

            <input
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value)
              }
              placeholder="+91 98765 43210"
            />

          </label>

        </div>


        {/* Headline */}
        <label>

          Professional headline

          <input
            value={form.headline}
            onChange={(e) =>
              update("headline", e.target.value)
            }
            placeholder="e.g. Full Stack Developer & UI/UX Enthusiast"
          />

        </label>


        {/* Location + Skills */}
        <div className="two-columns">

          <label>

            Location

            <input
              value={form.location}
              onChange={(e) =>
                update("location", e.target.value)
              }
              placeholder="Chennai, India"
            />

          </label>


          <label>

            Skills

            <input
              value={form.skills}
              onChange={(e) =>
                update("skills", e.target.value)
              }
              placeholder="React, Java, MongoDB"
            />

          </label>

        </div>


        {/* Bio */}
        <label>

          About you

          <textarea
            rows="6"
            value={form.bio}
            onChange={(e) =>
              update("bio", e.target.value)
            }
            placeholder="Tell people a little about your experience, interests and the kind of work you enjoy."
          />

        </label>


        {/* Saved message */}
        {saved && (
          <div className="form-success">
            ✓ Your profile details have been saved.
          </div>
        )}


        <button
          className="button button-primary button-large"
          type="submit"
        >
          Save profile
        </button>

      </form>

    </div>
  );
}