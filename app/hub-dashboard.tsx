"use client";

import { useEffect, useMemo, useState } from "react";
import MarketingRequestForm from "./marketing-request-form";
import ProductDatabase from "./product-database";
import ContentManager from "./content-manager";
import CalendarManager from "./calendar-manager";
import { BRUTTI_LOGO_DATA_URL } from "./brutti-logo-data";
import {
  facebookAnalytics,
  facebookRequests,
  faqSignals,
  systemFiles,
  type FacebookRequest,
} from "./brutti-facebook-data";

type View = "overview" | "requests" | "content" | "products" | "calendar" | "reports";

const navigation: Array<{ id: View; icon: string; label: string }> = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "requests", icon: "✦", label: "Marketing Requests" },
  { id: "content", icon: "▤", label: "Generated Content" },
  { id: "products", icon: "▦", label: "Product Database" },
  { id: "calendar", icon: "□", label: "Content Calendar" },
  { id: "reports", icon: "↗", label: "Reports" },
];

const LOCAL_REQUESTS_KEY = "brutti-marketing-requests";

function FacebookBadge() {
  return <span className="focus-badge">Facebook only</span>;
}

function RequestsList({ requests, compact = false }: { requests: FacebookRequest[]; compact?: boolean }) {
  const rows = compact ? requests.slice(0, 4) : requests;
  return (
    <div className="request-list">
      {rows.map((request, index) => (
        <div className="request-row" key={`${request.name}-${request.time}-${index}`}>
          <span className="platform-icon facebook">F</span>
          <div className="request-copy">
            <strong>{request.name}</strong>
            <small>{request.product} · {request.objective}</small>
            <small>Facebook · {request.time}</small>
          </div>
          <span className={`status-pill ${request.status.toLowerCase()}`}>{request.status}</span>
        </div>
      ))}
    </div>
  );
}

export default function HubDashboard() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [localRequests, setLocalRequests] = useState<FacebookRequest[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || "[]") as FacebookRequest[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const refresh = () => {
      try {
        setLocalRequests(JSON.parse(localStorage.getItem(LOCAL_REQUESTS_KEY) || "[]") as FacebookRequest[]);
      } catch {
        setLocalRequests([]);
      }
    };
    window.addEventListener("brutti-request-created", refresh);
    return () => window.removeEventListener("brutti-request-created", refresh);
  }, []);

  const allRequests = useMemo(() => [...localRequests, ...facebookRequests], [localRequests]);
  function goTo(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <button className="brand-mark brand-button" onClick={() => goTo("overview")}>
          <img className="brand-logo" src={BRUTTI_LOGO_DATA_URL} alt="BRUTTI logo" />
          <span><strong>BRUTTI</strong><small>AI Marketing Hub</small></span>
        </button>
        <nav className="nav-list">
          {navigation.map((item) => (
            <button key={item.id} className={`nav-item ${activeView === item.id ? "active" : ""}`} onClick={() => goTo(item.id)} aria-current={activeView === item.id ? "page" : undefined}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sync-card">
          <span className="sync-dot" />
          <div><strong>Make submission connected</strong><small>Facebook · checks every 15 minutes</small></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">BRUTTI AI Marketing System</p><h1>{navigation.find((item) => item.id === activeView)?.label}</h1></div>
          <FacebookBadge />
        </header>

        {activeView === "overview" && (
          <>
            <section className="hero-panel">
              <div>
                <p className="hero-kicker">Facebook content workspace</p>
                <h2>Plan, generate and review in one place.</h2>
                <p>Send a Facebook brief, view the AI drafts, browse products, plan the week and check verified Facebook activity without leaving this website.</p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => goTo("requests")}>+ New Facebook request</button>
                  <button className="secondary-button" onClick={() => goTo("content")}>Review generated content</button>
                </div>
              </div>
              <div className="workflow-orbit" aria-label="Website to Make and Notion workflow connected">
                <div className="orbit-core"><img className="hero-logo" src={BRUTTI_LOGO_DATA_URL} alt="BRUTTI" /></div>
                <span className="orbit-tag notion-tag">Notion</span><span className="orbit-tag make-tag">Make</span><span className="orbit-status">Connected</span>
              </div>
            </section>

            <section className="metric-grid" aria-label="Facebook workflow summary">
              <article className="metric-card"><span className="metric-icon moss">F</span><div><p>Facebook followers</p><strong>{facebookAnalytics.followers.toLocaleString()}</strong><small>Exported follower records</small></div></article>
              <article className="metric-card"><span className="metric-icon amber">♡</span><div><p>Incoming reactions</p><strong>{facebookAnalytics.incomingReactionRows.toLocaleString()}</strong><small>{facebookAnalytics.uniqueReactors} unique accounts</small></div></article>
              <article className="metric-card"><span className="metric-icon clay">✓</span><div><p>Automation</p><strong>On</strong><small>Request submission via Make</small></div></article>
              <article className="metric-card"><span className="metric-icon ink">▦</span><div><p>Products</p><strong>88</strong><small>Details available; photos pending</small></div></article>
            </section>

            <section className="dashboard-grid">
              <article className="panel request-panel">
                <div className="panel-heading"><div><p className="eyebrow">Workflow</p><h3>Recent Facebook requests</h3></div><button className="text-link" onClick={() => goTo("requests")}>View all →</button></div>
                <RequestsList requests={allRequests} compact />
              </article>
              <article className="panel progress-panel">
                <div className="panel-heading"><div><p className="eyebrow">Website data</p><h3>Verified snapshot</h3></div></div>
                <div className="file-status-list">{systemFiles.map((item) => <div className="file-status-row" key={item.label}><span>{item.label}</span><strong>{item.status}</strong></div>)}</div>
                <p className="snapshot-note">Notion and Google Drive checked on 11 Aug 2026.</p>
              </article>
            </section>
          </>
        )}

        {activeView === "requests" && (
          <>
            <section className="panel form-panel">
              <div className="panel-heading form-heading"><div><p className="eyebrow">Website → Make</p><h3>Create a Facebook marketing request</h3><p>The request is submitted directly from this website.</p></div><span className="connection-badge"><i /> Connected</span></div>
              <MarketingRequestForm />
            </section>
            <section className="panel section-gap">
              <div className="panel-heading"><div><p className="eyebrow">Request history</p><h3>Facebook requests</h3></div><span className="snapshot-label">Verified + current browser submissions</span></div>
              <RequestsList requests={allRequests} />
            </section>
          </>
        )}

        {activeView === "content" && <ContentManager />}

        {activeView === "products" && <ProductDatabase />}

        {activeView === "calendar" && <CalendarManager />}

        {activeView === "reports" && (
          <>
            <section className="report-hero">
              <div>
                <p className="eyebrow">Facebook export dashboard</p>
                <h2>Account &amp; Content Activity Report</h2>
                <p>Snapshot of BRUTTI&apos;s Facebook account and exported content activity. All figures below are record counts from the supplied workbooks—not live Meta performance metrics.</p>
              </div>
              <div className="report-period"><span>Source period</span><strong>{facebookAnalytics.sourcePeriod}</strong><small>Verified {facebookAnalytics.verifiedAt}</small></div>
            </section>

            <section className="panel section-gap">
              <div className="panel-heading"><div><p className="eyebrow">Account report</p><h3>Facebook account overview</h3></div><span className="snapshot-label">Exported profile data</span></div>
              <div className="account-report-grid">
                <article className="account-identity">
                  <span className="account-avatar">F</span>
                  <div><h4>{facebookAnalytics.accountName}</h4><p>@{facebookAnalytics.username}</p><span>{facebookAnalytics.category} · Registered {facebookAnalytics.registrationDate}</span></div>
                </article>
                <div className="account-stat"><span>Follower records</span><strong>{facebookAnalytics.followers.toLocaleString()}</strong><small>Snapshot count</small></div>
                <div className="account-stat"><span>Following</span><strong>{facebookAnalytics.following.toLocaleString()}</strong><small>Accounts followed</small></div>
                <div className="account-stat"><span>Profile</span><strong>Active</strong><small>{facebookAnalytics.profileUrl}</small></div>
              </div>
            </section>

            <section className="panel section-gap">
              <div className="panel-heading"><div><p className="eyebrow">Content report</p><h3>Facebook content activity</h3></div><span className="snapshot-label">Export record counts</span></div>
              <div className="analytics-summary">
                <div><strong>{facebookAnalytics.profilePostRows.toLocaleString()}</strong><span>Profile-post records</span></div>
                <div><strong>{facebookAnalytics.incomingReactionRows.toLocaleString()}</strong><span>Recent reaction records</span></div>
                <div><strong>{facebookAnalytics.commentRows.toLocaleString()}</strong><span>Comment / reply records</span></div>
                <div><strong>{facebookAnalytics.groupPostRows.toLocaleString()}</strong><span>Group-post records</span></div>
              </div>
              <div className="activity-strip" aria-label="Additional Facebook activity counts">
                <div><span>Historical reactions</span><strong>{facebookAnalytics.historicalReactionRows.toLocaleString()}</strong></div>
                <div><span>Post edits</span><strong>{facebookAnalytics.editedPostRows.toLocaleString()}</strong></div>
                <div><span>Pending group posts</span><strong>{facebookAnalytics.pendingRows.toLocaleString()}</strong></div>
                <div><span>Page invites sent</span><strong>{facebookAnalytics.pageInvites.toLocaleString()}</strong></div>
              </div>
              <div className="report-grid">
                <article className="report-block"><h4>Incoming reaction breakdown</h4><div className="bar-list">{facebookAnalytics.reactionBreakdown.map((item) => <div className="bar-row" key={item.name}><span>{item.name}</span><i style={{ width: `${Math.max(4, (item.rows / 359) * 100)}%` }} /><strong>{item.rows}</strong></div>)}</div><p className="mini-note">{facebookAnalytics.reactionPeriod} · Facebook export records</p></article>
                <article className="report-block content-mix-block"><h4>Content archive mix</h4><div className="content-mix"><div className="content-donut" aria-label="Media archive composition"><span><strong>7,219</strong><small>media records</small></span></div><div className="content-legend"><p><i className="photo-dot" />Photos <strong>{facebookAnalytics.photoFiles.toLocaleString()}</strong></p><p><i className="video-dot" />Videos <strong>{facebookAnalytics.videoFiles.toLocaleString()}</strong></p><p><i className="reel-dot" />Reels <strong>{facebookAnalytics.reelRows.toLocaleString()}</strong></p></div></div><p className="mini-note">Archive records may overlap with post records; they are not reach or views.</p></article>
                <article className="report-block"><h4>Monthly group-post activity</h4><div className="bar-list">{facebookAnalytics.monthly.map((item) => <div className="bar-row" key={item.month}><span>{item.month}</span><i style={{ width: `${Math.max(4, (item.rows / 687) * 100)}%` }} /><strong>{item.rows}</strong></div>)}</div><p className="mini-note">{facebookAnalytics.groupActivityPeriod}</p></article>
                <article className="report-block"><h4>Facebook group distribution</h4><div className="rank-list">{facebookAnalytics.groupsByActivity.map((item, index) => <div key={item.name}><span>{index + 1}</span><p>{item.name}</p><strong>{item.rows.toLocaleString()}</strong></div>)}</div></article>
                <article className="report-block"><h4>Content pillars</h4><div className="rank-list">{facebookAnalytics.pillars.map((item, index) => <div key={item.name}><span>{index + 1}</span><p>{item.name}</p><strong>{item.rows.toLocaleString()}</strong></div>)}</div></article>
                <article className="report-block"><h4>Inferred FAQ signals</h4><div className="tag-cloud">{faqSignals.map((item) => <span key={item}>{item}</span>)}</div><p className="mini-note">Topics are inferred from 11 BRUTTI reply records, not original customer questions.</p></article>
                <article className="report-block"><h4>Export quality notes</h4><div className="rank-list"><div><span>✓</span><p>Unique source workbooks used</p><strong>{facebookAnalytics.uniqueSourceFiles}</strong></div><div><span>✓</span><p>Duplicate workbook excluded</p><strong>1</strong></div><div><span>✓</span><p>BRUTTI-authored comments</p><strong>{facebookAnalytics.bruttiAuthoredComments.toLocaleString()}</strong></div><div><span>✓</span><p>Page invites sent</p><strong>{facebookAnalytics.pageInvites.toLocaleString()}</strong></div></div></article>
              </div>
            </section>
            <section className="report-footer-grid section-gap">
              <article className="panel limitation-panel"><h3>Performance KPIs not available</h3><div className="missing-kpi-grid">{facebookAnalytics.unavailableKpis.map((item) => <span key={item}>— {item}</span>)}</div><p>These values were not present in the supplied Facebook exports. The dashboard deliberately leaves them unavailable instead of estimating them.</p></article>
              <article className="panel source-panel"><h3>Workbook sources</h3><ol>{facebookAnalytics.sourceWorkbooks.map((item) => <li key={item}>{item}</li>)}</ol><p>One duplicate Facebook JSON workbook was excluded to prevent double counting.</p></article>
            </section>
          </>
        )}

        <footer><span>BRUTTI AI Marketing System</span><span>Website workspace · Facebook only · Snapshot verified 11 Aug 2026</span></footer>
      </section>
    </main>
  );
}
