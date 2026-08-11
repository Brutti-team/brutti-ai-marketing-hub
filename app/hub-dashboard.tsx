"use client";

import { useEffect, useMemo, useState } from "react";
import MarketingRequestForm from "./marketing-request-form";
import ProductDatabase from "./product-database";
import { BRUTTI_LOGO_DATA_URL } from "./brutti-logo-data";
import {
  facebookAnalytics,
  facebookCalendar,
  facebookGeneratedContent,
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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button className="copy-button" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>;
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
  const reviewCount = allRequests.filter((item) => item.status === "Review").length;

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

        {activeView === "content" && (
          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">AI output</p><h3>Generated Facebook content</h3></div><span className="snapshot-label">Ready to copy and review</span></div>
            <div className="content-cards">
              {facebookGeneratedContent.map((item) => (
                <article className="content-card" key={item.title}>
                  <div className="content-card-head"><span className="platform-icon facebook">F</span><div><strong>{item.title}</strong><small>Facebook · AI generated</small></div><span className="status-pill review">{item.status}</span></div>
                  <p className="preserve-lines">{item.content}</p><div className="content-actions"><CopyButton value={item.content} /></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "products" && <ProductDatabase />}

        {activeView === "calendar" && (
          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">Recommended draft plan</p><h3>Facebook weekly content calendar</h3></div><span className="snapshot-label">Edit the brief before publishing</span></div>
            <div className="calendar-grid">
              {facebookCalendar.map((item) => <article className="calendar-card" key={item.day}><span>{item.day}</span><strong>{item.theme}</strong><p>{item.product}</p><small>{item.format}</small><em>{item.status}</em></article>)}
            </div>
            <p className="data-note">This planner is a recommended Facebook-only draft based on BRUTTI products, content pillars and FAQ signals. Nothing is published automatically.</p>
          </section>
        )}

        {activeView === "reports" && (
          <>
            <section className="panel">
              <div className="panel-heading"><div><p className="eyebrow">Verified Facebook export</p><h3>Facebook activity report</h3></div><span className="snapshot-label">{facebookAnalytics.sourcePeriod}</span></div>
              <div className="analytics-summary">
                <div><strong>{facebookAnalytics.followers.toLocaleString()}</strong><span>Follower records</span></div><div><strong>{facebookAnalytics.incomingReactionRows.toLocaleString()}</strong><span>Incoming reactions</span></div><div><strong>{facebookAnalytics.uniqueReactors.toLocaleString()}</strong><span>Unique reacting accounts</span></div><div><strong>{facebookAnalytics.profilePostRows.toLocaleString()}</strong><span>Profile-post records</span></div>
              </div>
              <div className="report-grid">
                <article className="report-block"><h4>Incoming reaction breakdown</h4><div className="bar-list">{facebookAnalytics.reactionBreakdown.map((item) => <div className="bar-row" key={item.name}><span>{item.name}</span><i style={{ width: `${Math.max(4, (item.rows / 359) * 100)}%` }} /><strong>{item.rows}</strong></div>)}</div><p className="mini-note">{facebookAnalytics.reactionPeriod} · Facebook export records</p></article>
                <article className="report-block"><h4>Facebook content archive</h4><div className="rank-list"><div><span>1</span><p>Photos</p><strong>{facebookAnalytics.photoFiles.toLocaleString()}</strong></div><div><span>2</span><p>Videos</p><strong>{facebookAnalytics.videoFiles.toLocaleString()}</strong></div><div><span>3</span><p>Reel records</p><strong>{facebookAnalytics.reelRows.toLocaleString()}</strong></div><div><span>4</span><p>Profile-post records</p><strong>{facebookAnalytics.profilePostRows.toLocaleString()}</strong></div></div><p className="mini-note">Inventory counts may refer to overlapping media and post records; they are not summed as reach.</p></article>
                <article className="report-block"><h4>Monthly group-post activity</h4><div className="bar-list">{facebookAnalytics.monthly.map((item) => <div className="bar-row" key={item.month}><span>{item.month}</span><i style={{ width: `${Math.max(4, (item.rows / 687) * 100)}%` }} /><strong>{item.rows}</strong></div>)}</div><p className="mini-note">{facebookAnalytics.groupActivityPeriod}</p></article>
                <article className="report-block"><h4>Facebook group distribution</h4><div className="rank-list">{facebookAnalytics.groupsByActivity.map((item, index) => <div key={item.name}><span>{index + 1}</span><p>{item.name}</p><strong>{item.rows.toLocaleString()}</strong></div>)}</div></article>
                <article className="report-block"><h4>Content pillars</h4><div className="rank-list">{facebookAnalytics.pillars.map((item, index) => <div key={item.name}><span>{index + 1}</span><p>{item.name}</p><strong>{item.rows.toLocaleString()}</strong></div>)}</div></article>
                <article className="report-block"><h4>Inferred FAQ signals</h4><div className="tag-cloud">{faqSignals.map((item) => <span key={item}>{item}</span>)}</div><p className="mini-note">Topics are inferred from 11 BRUTTI reply records, not original customer questions.</p></article>
                <article className="report-block"><h4>Export quality notes</h4><div className="rank-list"><div><span>✓</span><p>Unique source workbooks used</p><strong>{facebookAnalytics.uniqueSourceFiles}</strong></div><div><span>✓</span><p>Duplicate workbook excluded</p><strong>1</strong></div><div><span>✓</span><p>BRUTTI-authored comments</p><strong>{facebookAnalytics.bruttiAuthoredComments.toLocaleString()}</strong></div><div><span>✓</span><p>Page invites sent</p><strong>{facebookAnalytics.pageInvites.toLocaleString()}</strong></div></div></article>
              </div>
            </section>
            <section className="panel section-gap limitation-panel"><h3>Data limitations</h3><p>The files verify follower records and incoming reaction records, but do not provide a time series for follower growth, verified reach, views, shares or conversions. Comment records mainly describe comments written by BRUTTI, not customer feedback. The “Close friends” audience file is a personal audience setting, not demographic insight. Therefore this website does not invent performance figures or claim which post was viral or best-performing.</p></section>
          </>
        )}

        <footer><span>BRUTTI AI Marketing System</span><span>Website workspace · Facebook only · Snapshot verified 11 Aug 2026</span></footer>
      </section>
    </main>
  );
}
