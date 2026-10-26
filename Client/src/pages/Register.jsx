import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "freelancer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser(form);
      setSuccess("Account created successfully. Taking you to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand"><span className="brand-mark">S</span> SkillHire</Link>
        <span className="eyebrow">Join the community</span>
        <h1>Let's get started.</h1>
        <p className="auth-subtitle">Create a profile and take your next step.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Full name<input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} placeholder="Your name" /></label>
          <label>Email address<input type="email" required value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} placeholder="you@example.com" /></label>
          <label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} placeholder="At least 6 characters" /></label>

          <div>
            <span className="field-label">I want to</span>
            <div className="role-grid">
              <button type="button" className={`role-option ${form.role === "freelancer" ? "selected" : ""}`} onClick={() => setForm({...form, role:"freelancer"})}>
                <strong>Find work</strong><span>I'm a freelancer</span>
              </button>
              <button type="button" className={`role-option ${form.role === "client" ? "selected" : ""}`} onClick={() => setForm({...form, role:"client"})}>
                <strong>Hire talent</strong><span>I'm a client</span>
              </button>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <button className="button button-primary button-large full-width" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}