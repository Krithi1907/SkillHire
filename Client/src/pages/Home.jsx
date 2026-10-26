import { Link } from "react-router-dom";

const highlights = [
  ["01", "Post a project", "Tell talented freelancers what you need and what success looks like."],
  ["02", "Discover skills", "Explore opportunities and find work that matches your strengths."],
  ["03", "Build together", "Keep communication and project progress in one simple place."],
];

export default function Home() {
  return (
    <div>
      <section className="hero section">
        <div className="hero-copy">
          <span className="eyebrow">A simpler way to work together</span>
          <h1>Good work starts with the <span>right people.</span></h1>
          <p>
            SkillHire connects clients with freelancers who can turn ideas into
            real projects — without making the process complicated.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/projects">
              Explore projects
            </Link>
            <Link className="button button-outline button-large" to="/register">
              Join SkillHire
            </Link>
          </div>
          <div className="hero-note">
            <span className="dot" /> Built for clients, freelancers and growing ideas
          </div>
        </div>

        <div className="hero-card">
          <div className="mini-window">
            <div className="window-dots"><i /><i /><i /></div>
            <div className="mock-label">YOUR NEXT OPPORTUNITY</div>
            <h3>Build a student community platform</h3>
            <p>Looking for a React developer to bring a fresh campus idea to life.</p>
            <div className="mock-row">
              <span>React</span><span>Node.js</span><span>MongoDB</span>
            </div>
            <div className="mock-bottom">
              <strong>₹25,000</strong>
              <span>2–4 weeks</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="section-heading centered">
          <span className="eyebrow">How it works</span>
          <h2>From idea to collaboration.</h2>
          <p>Everything starts with a clear project and the right person.</p>
        </div>

        <div className="steps-grid">
          {highlights.map(([number, title, text]) => (
            <div className="step-card" key={number}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <span className="eyebrow">Ready when you are</span>
          <h2>Have an idea? Let's make it happen.</h2>
        </div>
        <Link className="button button-light" to="/register">Create your account</Link>
      </section>
    </div>
  );
}