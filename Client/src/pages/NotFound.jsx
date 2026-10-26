import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-page">
      <span className="eyebrow">404</span>
      <h1>That page wandered off.</h1>
      <p>Let's get you back to somewhere useful.</p>
      <Link className="button button-primary" to="/">Go home</Link>
    </div>
  );
}