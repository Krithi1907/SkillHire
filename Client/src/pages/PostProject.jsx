import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/api";

export default function PostProject() {
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Development", budget: "", deadline: "", skills: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createProject({
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget),
        deadline: form.deadline,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setMessage("Project created successfully.");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page narrow-page">
      <div className="page-heading">
        <span className="eyebrow">Create an opportunity</span>
        <h1>Tell people what you want to build.</h1>
        <p>A clear project brief helps the right freelancer understand your idea.</p>
      </div>

      <form className="form-card" onSubmit={submit}>
        <label>Project title<input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Build a student marketplace" /></label>
        <label>Description<textarea required rows="6" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What are you trying to achieve? What would success look like?" /></label>

        <div className="two-columns">
          <label>Category
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option>Web Development</option>
              <option>Mobile Development</option>
              <option>UI/UX Design</option>
              <option>Data & AI</option>
              <option>Marketing</option>
              <option>Other</option>
            </select>
          </label>
          <label>Budget (₹)<input type="number" min="0" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="25000" /></label>
        </div>

        <div className="two-columns">
          <label>Deadline<input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} /></label>
          <label>Skills <input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, Node.js, MongoDB" /></label>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        <button className="button button-primary button-large">Publish project</button>
      </form>
    </div>
  );
}