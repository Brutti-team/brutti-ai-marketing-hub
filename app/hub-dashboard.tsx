"use client";

import { useEffect, useMemo, useState } from "react";
import MarketingRequestForm from "./marketing-request-form";
import ProductDatabase from "./product-database";
import ContentManager from "./content-manager";
import CalendarManager from "./calendar-manager";
import PwaControls from "./pwa-controls";
import { BRUTTI_LOGO_DATA_URL } from "./brutti-logo-data";
import {
  facebookAnalytics,
  facebookRequests,
  faqSignals,
  systemFiles,
  type FacebookRequest,
} from "./brutti-facebook-data";
import type { MarketingRequestRecord } from "./lib/brutti-store";

type View = "overview" | "requests" | "content" | "products" | "calendar" | "reports";

type MetaInsights = {
  sourceUpdatedAt: string | null;
  instagram: { latestReach: number | null; trend: Array<{ date: string; value: number }> };
  facebook: { topPosts: Array<{ sourceId: string; views: number; measuredAt: string | null }> };
};

const navigation: Array<{ id: View; icon: string; label: string }> = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "requests", icon: "✦", label: "Marketing Requests" },
  { id: "content", icon: "▤", label: "Generated Content" },
  { id: "products", icon: "▦", label: "Product Database" },
  { id: "calendar", icon: "□", label: "Content Calendar" },
  { id: "reports", icon: "↗", label: "Reports" },
];

const mobilePrimaryNavigation: View[] = ["overview", "requests", "content", "calendar"];
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

function compactPostId(sourceId: string) {
  const segments = sourceId.split("_");
  return segments.length === 2 ? `Post ${segments[1]}` : sourceId;
}

function displayDate(value: string | null) {
  if (!value) return "Waiting for source data";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function LiveMetaInsights() {
  const [insights, setInsights] = useState<MetaInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/meta-insights", { cache: "no-store" });
      const data = await response.json() as MetaInsights & { error?: string };
      if (!response.ok) throw new Error(data.error || "Live insights are unavailable.");
      setInsights(data);
    } catch (error) {
      setInsights(null);
      setMessage(error instanceof Error ? error.message : "Live insights are unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const trend = insights?.instagram.trend || [];
  const highestTrendValue = Math.max(1, ...trend.map((point) => point.value));

  return (
    <section className="panel section-gap live-insights-panel" aria-live="polite">
      <div className="panel-heading">
        <div><p className="eyebrow">Live Google Sheet sync</p><h3>Meta insights</h3></div>
        <button className="text-link" onClick={() => void refresh()} disabled={loading}>{loading ? "Refreshing…" : "Refresh ↻"}</button>
      </div>

      {message && <p className="meta-insights-message">{message}</p>}

      {!message && (
        <div className="live-insights-grid">
          <article className="live-insight-card instagram-card">
            <div className="live-insight-label"><span className="platform-icon instagram">◎</span><span>Instagram</span></div>
            <strong>{insights?.instagram.latestReach?.toLocaleString() ?? "—"}</strong>
            <small>Latest recorded daily reach</small>
            {trend.length > 0 ? (
              <div className="reach-trend" role="img" aria-label="Instagram reach trend">
                {trend.map((point) => (
                  <span key={`${point.date}-${point.value}`} title={`${displayDate(point.date)}: ${point.value.toLocaleString()} reach`} style={{ height: `${Math.max(10, (point.value / highestTrendValue) * 100)}%` }} />
                ))}
              </div>
            ) : <p className="meta-empty">Reach trend will appear after the next sync.</p>}
          </article>

          <article className="live-insight-card facebook-top-posts">
            <div className="live-insight-label"><span className="platform-icon facebook">F</span><span>Facebook</span></div>
            <h4>Top posts by media views</h4>
            {insights?.facebook.topPosts.length ? (
              <ol className="top-post-list">
                {insights.facebook.topPosts.map((post, index) => (
                  <li key={post.sourceId}><span>{index + 1}</span><p>{compactPostId(post.sourceId)}<small>{displayDate(post.measuredAt)}</small></p><strong>{post.views.toLocaleString()}</strong></li>
                ))}
              </ol>
            ) : <p className="meta-empty">Post performance will appear after the next sync.</p>}
          </article>
        </div>
      )}

      {insights?.sourceUpdatedAt && <p className="meta-source-note">Last sheet update: {displayDate(insights.sourceUpdatedAt)} · Meta token remains on the private backend.</p>}
    </section>
  );
}

export default function HubDashboard() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedRequests, setSavedRequests] = useState<FacebookRequest[]>([]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/marketing-request", { cache: "no-store" });
        const data = await response.json() as { items?: MarketingRequestRecord[] };
        if (!active) return;
        setSavedRequests((data.items || []).map((item) => ({
          name: item.name,
          product: item.productName || "General BRUTTI brand",
          objective: item.objective,
          status: "New",
          time: new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(item.submittedAt)),
          hasContent: false,
        })));
      } catch {
        if (active) setSavedRequests([]);
      }
    };
    void refresh();
    const handleCreated = () => void refresh();
    window.addEventListener("brutti-request-created", handleCreated);
    return () => {
      active = false;
      window.removeEventListener("brutti-request-created", handleCreated);
    };
  }, []);

  useEffect(() => {
    const readViewFromUrl = () => {
      const requested = new URLSearchParams(window.location.search).get("view") as View | null;
      if (requested && navigation.some((item) => item.id === requested)) setActiveView(requested);
      else setActiveView("overview");
    };
    readViewFromUrl();
    window.addEventListener("popstate", readViewFromUrl);
    return () => window.removeEventListener("popstate", readViewFromUrl);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileMenuOpen);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("mobile-menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const allRequests = useMemo(() => [...savedRequests, ...facebookRequests], [savedRequests]);
  function goTo(view: View) {
    setActiveView(view);
    setMobileMenuOpen(false);
    const url = new URL(window.location.href);
    if (view === "overview") url.searchParams.delete("view");
    else url.searchParams.set("view", view);
    window.history.pushState({}, "", url);
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
          <div><strong>Hub storage active</strong><small>Facebook requests stay on this website</small></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <img className="mobile-header-logo" src={BRUTTI_LOGO_DATA_URL} alt="" aria-hidden="true" />
          <div className="topbar-title"><p className="eyebrow">BRUTTI AI Marketing System</p><h1>{navigation.find((item) => item.id === activeView)?.label}</h1></div>
          <div className="topbar-actions"><FacebookBadge /><PwaControls /></div>
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
              <div className="workflow-orbit" aria-label="Website requests are saved in the Hub">
                <div className="orbit-core"><img className="hero-logo" src={BRUTTI_LOGO_DATA_URL} alt="BRUTTI" /></div>
                <span className="orbit-tag hub-tag">Hub</span><span className="orbit-status">Saved</span>
              </div>
            </section>

            <section className="metric-grid" aria-label="Facebook workflow summary">
              <article className="metric-card"><span className="metric-icon moss">F</span><div><p>Facebook followers</p><strong>{facebookAnalytics.followers.toLocaleString()}</strong><small>Exported follower records</small></div></article>
              <article className="metric-card"><span className="metric-icon amber">♡</span><div><p>Incoming reactions</p><strong>{facebookAnalytics.incomingReactionRows.toLocaleString()}</strong><small>{facebookAnalytics.uniqueReactors} unique accounts</small></div></article>
              <article className="metric-card"><span className="metric-icon clay">✓</span><div><p>Requests</p><strong>Saved</strong><small>Stored directly in the Hub</small></div></article>
              <article className="metric-card"><span className="metric-icon ink">▦</span><div><p>Products</p><strong>88</strong><small>Details available; 10 photos confirmed</small></div></article>
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
              <div className="panel-heading form-heading"><div><p className="eyebrow">Website → Hub</p><h3>Create a Facebook marketing request</h3><p>The request is saved directly in this website.</p></div><span className="connection-badge"><i /> Stored here</span></div>
              <MarketingRequestForm />
            </section>
            <section className="panel section-gap">
              <div className="panel-heading"><div><p className="eyebrow">Request history</p><h3>Facebook requests</h3></div><span className="snapshot-label">Verified + requests saved in this Hub</span></div>
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
                <p className="eyebrow">Facebook &amp; Instagram dashboard</p>
                <h2>Account &amp; Content Activity Report</h2>
                <p>Review the live Meta insight summary alongside BRUTTI&apos;s verified Facebook archive. The account report below remains a historical workbook snapshot.</p>
              </div>
              <div className="report-period"><span>Source period</span><strong>{facebookAnalytics.sourcePeriod}</strong><small>Verified {facebookAnalytics.verifiedAt}</small></div>
            </section>

            <LiveMetaInsights />

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

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobilePrimaryNavigation.map((id) => {
          const item = navigation.find((entry) => entry.id === id)!;
          return (
            <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => goTo(item.id)} aria-current={activeView === item.id ? "page" : undefined}>
              <span aria-hidden="true">{item.icon}</span><small>{item.label === "Marketing Requests" ? "Requests" : item.label === "Generated Content" ? "Content" : item.label === "Content Calendar" ? "Calendar" : "Home"}</small>
            </button>
          );
        })}
        <button className={mobileMenuOpen || activeView === "products" || activeView === "reports" ? "active" : ""} onClick={() => setMobileMenuOpen(true)} aria-expanded={mobileMenuOpen}>
          <span aria-hidden="true">•••</span><small>More</small>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-layer" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setMobileMenuOpen(false);
        }}>
          <section className="mobile-menu-sheet" role="dialog" aria-modal="true" aria-label="All BRUTTI AI sections">
            <div className="mobile-menu-handle" aria-hidden="true" />
            <div className="mobile-menu-heading"><div><p className="eyebrow">BRUTTI AI</p><h2>All sections</h2></div><button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">×</button></div>
            <div className="mobile-menu-grid">
              {navigation.map((item) => (
                <button key={item.id} className={activeView === item.id ? "active" : ""} onClick={() => goTo(item.id)}>
                  <span aria-hidden="true">{item.icon}</span><strong>{item.label}</strong>
                </button>
              ))}
            </div>
            <div className="mobile-sync-status"><span className="sync-dot" /><div><strong>BRUTTI workspace ready</strong><small>Best experience with an internet connection</small></div></div>
          </section>
        </div>
      )}
    </main>
  );
}
