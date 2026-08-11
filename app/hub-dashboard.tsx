"use client";

import { useState } from "react";
import MarketingRequestForm from "./marketing-request-form";
import { BRUTTI_LOGO_DATA_URL } from "./brutti-logo-data";
import {
  facebookGeneratedContent,
  facebookRequests,
  links,
  systemFiles,
} from "./brutti-facebook-data";

type View =
  | "overview"
  | "requests"
  | "content"
  | "products"
  | "calendar"
  | "reports";

const navigation: Array<{ id: View; icon: string; label: string }> = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "requests", icon: "✦", label: "Marketing Requests" },
  { id: "content", icon: "▤", label: "Generated Content" },
  { id: "products", icon: "▦", label: "Product Database" },
  { id: "calendar", icon: "□", label: "Content Calendar" },
  { id: "reports", icon: "↗", label: "Reports" },
];

function FacebookBadge() {
  return <span className="focus-badge">Facebook only</span>;
}

function RequestsList() {
  return (
    <div className="request-list">
      {facebookRequests.map((request) => (
        <div className="request-row" key={request.name}>
          <span className="platform-icon facebook">F</span>
          <div className="request-copy">
            <strong>{request.name}</strong>
            <small>{request.platform} · {request.time}</small>
          </div>
          <span className="status-pill review">{request.status}</span>
        </div>
      ))}
    </div>
  );
}

export default function HubDashboard() {
  const [activeView, setActiveView] = useState<View>("overview");

  function goTo(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <button className="brand-mark brand-button" onClick={() => goTo("overview")}>
          <img className="brand-logo" src={BRUTTI_LOGO_DATA_URL} alt="BRUTTI logo" />
          <span>
            <strong>BRUTTI</strong>
            <small>AI Marketing Hub</small>
          </span>
        </button>

        <nav className="nav-list">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => goTo(item.id)}
              aria-current={activeView === item.id ? "page" : undefined}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="sync-card">
          <span className="sync-dot" />
          <div>
            <strong>Automation active</strong>
            <small>Facebook · every 15 minutes</small>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">BRUTTI AI Marketing System</p>
            <h1>{navigation.find((item) => item.id === activeView)?.label}</h1>
          </div>
          <FacebookBadge />
        </header>

        {activeView === "overview" && (
          <>
            <section className="hero-panel">
              <div>
                <p className="hero-kicker">Facebook content system</p>
                <h2>Your Facebook marketing workflow is ready.</h2>
                <p>
                  Create a Facebook request here, let Make and the AI prepare the
                  content, then review the result in Notion.
                </p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => goTo("requests")}>
                    + New Facebook request
                  </button>
                  <button className="secondary-button" onClick={() => goTo("content")}>
                    Review generated content
                  </button>
                </div>
              </div>
              <div className="workflow-orbit" aria-label="Notion to AI workflow active">
                <div className="orbit-core">
                  <img className="hero-logo" src={BRUTTI_LOGO_DATA_URL} alt="BRUTTI" />
                </div>
                <span className="orbit-tag notion-tag">Notion</span>
                <span className="orbit-tag make-tag">Make</span>
                <span className="orbit-status">Live</span>
              </div>
            </section>

            <section className="metric-grid" aria-label="Facebook workflow summary">
              <article className="metric-card">
                <span className="metric-icon moss">F</span>
                <div><p>Active platform</p><strong>Facebook</strong><small>Other platforms hidden</small></div>
              </article>
              <article className="metric-card">
                <span className="metric-icon amber">◷</span>
                <div><p>Current queue</p><strong>Review</strong><small>Check content in Notion</small></div>
              </article>
              <article className="metric-card">
                <span className="metric-icon clay">✓</span>
                <div><p>Automation</p><strong>Active</strong><small>Runs every 15 minutes</small></div>
              </article>
              <article className="metric-card">
                <span className="metric-icon ink">▦</span>
                <div><p>Product photos</p><strong>Pending</strong><small>To be added later</small></div>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="panel request-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">Workflow</p><h3>Recent Facebook request</h3></div>
                  <button className="text-link" onClick={() => goTo("requests")}>View all →</button>
                </div>
                <RequestsList />
              </article>
              <article className="panel progress-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">Knowledge base</p><h3>Files status</h3></div>
                </div>
                <div className="file-status-list">
                  {systemFiles.map((item) => (
                    <div className="file-status-row" key={item.label}>
                      <span>{item.label}</span><strong>{item.status}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {activeView === "requests" && (
          <>
            <section className="panel form-panel">
              <div className="panel-heading form-heading">
                <div>
                  <p className="eyebrow">Connected to Make</p>
                  <h3>Create a Facebook marketing request</h3>
                  <p>Complete the brief below. This form sends Facebook requests only.</p>
                </div>
                <span className="connection-badge"><i /> Secure connection</span>
              </div>
              <MarketingRequestForm />
            </section>
            <section className="panel section-gap">
              <div className="panel-heading">
                <div><p className="eyebrow">Notion queue</p><h3>Facebook requests</h3></div>
                <a href={links.marketingRequests} target="_blank" rel="noreferrer">Open Notion ↗</a>
              </div>
              <RequestsList />
            </section>
          </>
        )}

        {activeView === "content" && (
          <section className="panel">
            <div className="panel-heading">
              <div><p className="eyebrow">AI output</p><h3>Generated Facebook content</h3></div>
              <a href={links.marketingRequests} target="_blank" rel="noreferrer">Review in Notion ↗</a>
            </div>
            <div className="content-cards">
              {facebookGeneratedContent.map((item) => (
                <article className="content-card" key={item.title}>
                  <div className="content-card-head">
                    <span className="platform-icon facebook">F</span>
                    <div><strong>{item.title}</strong><small>Facebook · AI generated</small></div>
                    <span className="status-pill review">{item.status}</span>
                  </div>
                  <p>{item.content}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "products" && (
          <section className="panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Product database</p><h3>BRUTTI product files</h3></div>
              <a href={links.driveRoot} target="_blank" rel="noreferrer">Open Google Drive ↗</a>
            </div>
            <div className="empty-state">
              <span className="empty-icon">▦</span>
              <h4>Basic product records are kept in the BRUTTI file structure.</h4>
              <p>Front-view, side-view and customer product photos are intentionally marked as pending until you upload them.</p>
            </div>
          </section>
        )}

        {activeView === "calendar" && (
          <section className="panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Planning</p><h3>Facebook content calendar</h3></div>
            </div>
            <div className="link-card-grid">
              <a className="link-card" href={links.dailyPlanner} target="_blank" rel="noreferrer">
                <span>Notion</span><strong>BRUTTI Daily Content Planner</strong><small>Plan and review Facebook content ↗</small>
              </a>
              <a className="link-card" href={links.plannerSheet} target="_blank" rel="noreferrer">
                <span>Google Sheets</span><strong>Planner spreadsheet</strong><small>Open the structured planning file ↗</small>
              </a>
            </div>
          </section>
        )}

        {activeView === "reports" && (
          <section className="panel">
            <div className="panel-heading">
              <div><p className="eyebrow">Analytics</p><h3>Facebook reports</h3></div>
              <a href={links.driveRoot} target="_blank" rel="noreferrer">Open source files ↗</a>
            </div>
            <div className="report-note">
              <span className="platform-icon facebook">F</span>
              <div>
                <strong>Facebook is the only active reporting source.</strong>
                <p>TikTok, Instagram and Threads reports are hidden until real data is supplied. No placeholder performance figures are shown.</p>
              </div>
            </div>
          </section>
        )}

        <footer>
          <span>BRUTTI AI Marketing System</span>
          <span>Facebook · Notion · Make · AI Agent</span>
        </footer>
      </section>
    </main>
  );
}
