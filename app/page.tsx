import MarketingRequestForm from "./marketing-request-form";
import { BRUTTI_LOGO_DATA_URL } from "./brutti-logo-data";

const requests = [
  {
    name: "Facebook Brand Awareness Post",
    platform: "Facebook",
    status: "Review",
    time: "10 Aug 2026, 9:59 AM",
  },
  {
    name: "TikTok Product Caption",
    platform: "TikTok",
    status: "New",
    time: "10 Aug 2026, 9:42 AM",
  },
  {
    name: "Instagram Product Story",
    platform: "Instagram",
    status: "Approved",
    time: "9 Aug 2026, 4:18 PM",
  },
];

const folderProgress = [
  { label: "Company Profile", value: 88 },
  { label: "Product Database", value: 62 },
  { label: "Customer Research", value: 100 },
  { label: "Content Strategy", value: 100 },
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand-mark" aria-label="BRUTTI">
          <img
            className="brand-logo"
            src={BRUTTI_LOGO_DATA_URL}
            alt="BRUTTI logo"
          />
          <span>
            <strong>BRUTTI</strong>
            <small>AI Marketing Hub</small>
          </span>
        </div>

        <nav className="nav-list">
          <a className="nav-item active" href="#overview">
            <span>⌂</span> Overview
          </a>
          <a className="nav-item" href="#requests">
            <span>✦</span> Marketing Requests
          </a>
          <a className="nav-item" href="#content">
            <span>▤</span> Generated Content
          </a>
          <a className="nav-item" href="#products">
            <span>▦</span> Product Database
          </a>
          <a className="nav-item" href="#calendar">
            <span>□</span> Content Calendar
          </a>
          <a className="nav-item" href="#reports">
            <span>↗</span> Reports
          </a>
        </nav>

        <div className="sync-card">
          <span className="sync-dot" />
          <div>
            <strong>Automation active</strong>
            <small>Checks every 15 minutes</small>
          </div>
        </div>
      </aside>

      <section className="workspace" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">Monday, 10 August 2026</p>
            <h1>Marketing overview</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">
              ◉
            </button>
            <button className="profile-button" aria-label="Open profile menu">
              MC
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="hero-kicker">BRUTTI content system</p>
            <h2>Your marketing workflow is running.</h2>
            <p>
              Send a request from this hub, let Make and the AI prepare the
              content, then review and approve it in Notion.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#request-form">
                + New marketing request
              </a>
              <a className="secondary-button" href="#content">
                Review AI content
              </a>
            </div>
          </div>
          <div className="workflow-orbit" aria-label="Notion to AI workflow active">
            <div className="orbit-core">
              <img
                className="hero-logo"
                src={BRUTTI_LOGO_DATA_URL}
                alt="BRUTTI"
              />
            </div>
            <span className="orbit-tag notion-tag">Notion</span>
            <span className="orbit-tag make-tag">Make</span>
            <span className="orbit-status">Live</span>
          </div>
        </section>

        <section className="metric-grid" aria-label="Marketing summary">
          <article className="metric-card">
            <span className="metric-icon moss">✦</span>
            <div>
              <p>New requests</p>
              <strong>3</strong>
              <small>Ready for AI</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon amber">◷</span>
            <div>
              <p>Awaiting review</p>
              <strong>5</strong>
              <small>Needs your approval</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon clay">✓</span>
            <div>
              <p>Approved</p>
              <strong>18</strong>
              <small>This month</small>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon ink">▦</span>
            <div>
              <p>Products recorded</p>
              <strong>92</strong>
              <small>BRUTTI catalogue</small>
            </div>
          </article>
        </section>

        <section className="panel form-panel" id="request-form">
          <div className="panel-heading form-heading">
            <div>
              <p className="eyebrow">Connected to Make</p>
              <h3>Create a marketing request</h3>
              <p>
                Complete the brief below. Make will forward it into the BRUTTI
                Marketing Requests workflow.
              </p>
            </div>
            <span className="connection-badge"><i /> Secure connection</span>
          </div>
          <MarketingRequestForm />
        </section>

        <section className="dashboard-grid">
          <article className="panel request-panel" id="requests">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Workflow</p>
                <h3>Recent marketing requests</h3>
              </div>
              <a href="#requests">View all →</a>
            </div>

            <div className="request-list">
              {requests.map((request) => (
                <div className="request-row" key={request.name}>
                  <span className={`platform-icon ${request.platform.toLowerCase()}`}>
                    {request.platform.charAt(0)}
                  </span>
                  <div className="request-copy">
                    <strong>{request.name}</strong>
                    <small>
                      {request.platform} · {request.time}
                    </small>
                  </div>
                  <span className={`status-pill ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel progress-panel" id="products">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Knowledge base</p>
                <h3>System readiness</h3>
              </div>
              <span className="score-ring">88%</span>
            </div>
            <div className="progress-list">
              {folderProgress.map((item) => (
                <div className="progress-row" key={item.label}>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer>
          <span>BRUTTI AI Marketing System</span>
          <span>Notion · Make · AI Agent</span>
        </footer>
      </section>
    </main>
  );
}
