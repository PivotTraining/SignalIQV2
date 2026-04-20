"use client";
import Link from "next/link";
import ProspectRow from "./ProspectRow";
import { feed, kpis } from "@/lib/data";
import { rScore } from "@/lib/rscore";
import { useProspects } from "@/lib/useProspects";
import { calcSignalScore, signalBand } from "@/lib/airtable";
import SignalScoreBadge from "./SignalScoreBadge";

export default function CommandCenter() {
  const { prospects, source, lastSync } = useProspects();

  const sorted = [...prospects].sort((a, b) => rScore(b) - rScore(a)).slice(0, 5);

  const pipeline = prospects
    .filter(p => !["Closed-Won","Closed-Lost"].includes(p.state as unknown as string))
    .reduce((s, p) => s + p.budgetIndicator * 1000, 0);

  const ventralPct = prospects.length
    ? Math.round(100 * prospects.filter(p => p.state === "ventral").length / prospects.length)
    : 0;

  const avgR = prospects.length
    ? Math.round(10 * prospects.reduce((s, p) => s + rScore(p), 0) / prospects.length) / 10
    : 0;

  const k = kpis(); // static fallback for meetings

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1>Good morning, Chris.</h1>
          <p>
            {source === "airtable"
              ? `Live from Airtable · ${prospects.length} contacts · synced ${lastSync?.toLocaleTimeString()}`
              : "Seed data — connect Airtable to go live"}
          </p>
        </div>
        <div className="topbar-actions">
          <div className="pill">
            <span className="pill-dot" />
            {source === "airtable" ? "Airtable live" : "NSS engine live"}
          </div>
          <button className="btn">Import list</button>
          <button className="btn btn-primary">Run signal sweep</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Active Pipeline</div>
          <div className="kpi-value">${pipeline.toLocaleString()}</div>
          <div className="kpi-delta">▲ 28% vs last week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Ventral Vagal %</div>
          <div className="kpi-value">{ventralPct}%</div>
          <div className="kpi-delta">▲ 9pts — healthy zone</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Meetings Booked</div>
          <div className="kpi-value">{k.meetingsBooked}</div>
          <div className="kpi-delta">▲ 6 this week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg R-Score</div>
          <div className="kpi-value">{avgR}</div>
          <div className="kpi-delta down">▼ 2.1 — refresh signals</div>
        </div>
      </div>

      {/* Signal Score band summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {(["hot","warm","cooling","cold","dormant"] as const).map(band => {
          const count = prospects.filter(p => {
            const score = calcSignalScore({
              lastTouchDaysAgo: p.lastTouchDaysAgo,
              interactions90d:  p.interactions.length,
              avgDepth: 3,
              intent: p.intentVelocity,
            });
            return signalBand(score) === band;
          }).length;
          if (!count) return null;
          return <SignalScoreBadge key={band} score={
            band === "hot" ? 90 : band === "warm" ? 70 : band === "cooling" ? 50 : band === "cold" ? 30 : 10
          } />;
        })}
      </div>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Prioritized Prospects</div>
              <div className="card-sub">Sorted by readiness × nervous system opportunity</div>
            </div>
            <Link href="/prospects" className="micro-btn">View all</Link>
          </div>
          {sorted.length === 0
            ? <div className="empty">Loading prospects…</div>
            : sorted.map(p => <ProspectRow key={p.id} p={p} />)}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Signal Feed</div>
              <div className="card-sub">State changes and intent events</div>
            </div>
            <Link href="/signals" className="micro-btn">Full feed</Link>
          </div>
          {feed.slice(0, 6).map(f => (
            <div className="feed-item" key={f.id}>
              <div className="feed-icon">{f.icon}</div>
              <div className="feed-body">
                <div className="feed-text" dangerouslySetInnerHTML={{ __html: f.html }} />
                <div className="feed-meta">{f.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-strip">
        <div>
          <h3>Your product is built. Now let AI close the customer.</h3>
          <p>
            {source === "airtable"
              ? "Cloud synced · Chris & Jazmine share one source of truth · Signal Scores update automatically"
              : "Built on polyvagal theory. Engineered in Cleveland and Atlanta."}
          </p>
        </div>
        <button className="btn btn-primary">Book a demo</button>
      </div>
    </>
  );
}
