import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);
      login(data);
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage
      title="Welcome back."
      subtitle="Log in to continue working on what matters."
      footer={<>New to SkillHire? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        <label>Email address<input type="email" required value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} placeholder="you@example.com" /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} placeholder="Your password" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary button-large full-width" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthPage>
  );
}

function AuthPage({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand"><span className="brand-mark">S</span> SkillHire</Link>
        <span className="eyebrow">Your workspace</span>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </div>
  );
}