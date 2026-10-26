import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-inner">

        {/* Logo */}
        <Link to="/" className="brand">
          <span className="brand-mark">S</span>
          <span>SkillHire</span>
        </Link>

        {/* Navigation */}
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/projects">
            Find Work
          </NavLink>

          {user && (
            <NavLink to="/dashboard">
              Dashboard
            </NavLink>
          )}

          {user && (
            <NavLink to="/profile">
              My Profile
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="nav-actions">

          {user ? (
            <>
              <Link to="/profile" className="profile-pill">
                <span className="avatar-button">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>

                <span className="profile-pill-name">
                  {user.name || "Profile"}
                </span>
              </Link>

              <button
                className="button button-outline"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-ghost">
                Log in
              </Link>

              <Link to="/register" className="button button-primary">
                Get started
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}