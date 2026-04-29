"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ProspectRow from "./ProspectRow";
import ProspectModal from "./ProspectModal";
import { kpis } from "@/lib/data";
import { rScore } from "@/lib/rscore";
import { useProspects } from "@/lib/useProspects";
import { calcSignalScore, signalBand } from "@/lib/scoring";
import SignalScoreBadge from "./SignalScoreBadge";
import type { Prospect } from "@/lib/types";
import type { FeedEvent } from "@/app/api/feed/route";

const TYPE_COLORS: Record<string, string> = {
  "signal-alert": "#f97316",
  "pressure":     "#ef4444",
  "burnout":      "#eab308",
  "outreach":     "var(--accent)",
  "re-engage":    "#a855f7",
  "score-update": "#22c55e",
};

const TYPE_LABELS: Record<string, string> = {
  "signal-alert": "Alert",
  "pressure":     "PressureIQ",
  "burnout":      "BurnoutIQ",
  "outreach":     "Outreach",
  "re-engage":    "Re-engage",
};

export default function CommandCenter() {
  const { prospects, source, lastSync, refetch } = useProspects();
  const [sweeping, setSweeping]   = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [modal, setModal]         = useState<Prospect | null>(null);
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/feed")
      .then(r => r.json())
      .then((d: { events: FeedEvent[] }) => setFeedEvents(d.events ?? []))
      .catch(() => {});
  }, []);

  async function runSignalSweep() {
    setSweeping(true);
    setActionMsg("Recalculating scores…");
    try {
      const res  = await fetch("/api/signal-sweep", { method: "POST" });
      const json = await res.json() as { updated?: number; errors?: number };
      setActionMsg(`✓ ${json.updated ?? 0} scores updated`);
      await refetch();
    } catch {
      setActionMsg("Sweep failed — try again");
    } finally {
      setSweeping(false);
      setTimeout(() => setActionMsg(""), 4000);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res  = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: text,
    });
    if (res.ok) {
      const json = await res.json() as { inserted?: number };
      setActionMsg(`✓ ${json.inserted ?? 0} contacts imported`);
      await refetch();
      setTimeout(() => setActionMsg(""), 4000);
    }
    e.target.value = "";
  }

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

  const k = kpis();

  // PressureIQ and BurnoutIQ summary counts from live feed
  const pressureEvents = feedEvents.filter(e => e.type === "pressure");
  const burnoutEvents  = feedEvents.filter(e => e.type === "burnout");

  // Live feed for home widget (show mix of types, not just alerts)
  const homeEvents = feedEvents.slice(0, 6);

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1>Good morning, Chris.</h1>
          <p>
            {source === "supabase"
              ? `Live from Supabase · ${prospects.length} contacts · synced ${lastSync?.toLocaleTimeString()}`
              : source === "airtable"
              ? `Live from Airtable · ${prospects.length} contacts · synced ${lastSync?.toLocaleTimeString()}`
              : "Seed data — connect Supabase or Airtable to go live"}
          </p>
        </div>
        <div className="topbar-actions">
          <div className="pill">
            <span className="pill-dot" />
            {source === "supabase" ? "Supabase live" : source === "airtable" ? "Airtable live" : "NSS engine live"}
          </div>
          {actionMsg && (
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
              {actionMsg}
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button className="btn" onClick={() => fileRef.current?.click()}>Import list</button>
          <button
            className="btn btn-primary"
            onClick={runSignalSweep}
            disabled={sweeping}
          >
            {sweeping ? "Sweeping…" : "Run signal sweep"}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Active Pipeline</div>
          <div className="kpi-value">${pipeline.toLocaleString()}</div>
          <div className="kpi-delta">▲ 28% vs last week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Engaged %</div>
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

      {modal && <ProspectModal prospect={modal} onClose={() => setModal(null)} />}

      {/* PressureIQ + BurnoutIQ Intelligence Strip */}
      {(pressureEvents.length > 0 || burnoutEvents.length > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {pressureEvents.length > 0 && (
            <div style={{
              flex: 1, minWidth: 280,
              background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 12,
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#ef4444" }}>PressureIQ</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{pressureEvents.length} schools with active pressure signals</div>
                </div>
                <Link href="/signals" style={{ marginLeft: "auto", fontSize: 11, color: "#ef4444", textDecoration: "none", fontWeight: 600 }}>
                  View all →
                </Link>
              </div>
              {pressureEvents.slice(0, 3).map(e => (
                <Link key={e.id} href={`/prospects/${e.contactId}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "7px 10px", borderRadius: 8, marginBottom: 4,
                    background: "rgba(239,68,68,0.06)",
                    fontSize: 12, color: "var(--text-1)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
                  >
                    <span style={{ fontWeight: 600, color: "var(--text-0)" }}>{e.contactName}</span>
                    <span style={{ color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.meta.split(" · ")[0]}
                    </span>
                    <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {burnoutEvents.length > 0 && (
            <div style={{
              flex: 1, minWidth: 280,
              background: "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(234,179,8,0.03))",
              border: "1px solid rgba(234,179,8,0.25)",
              borderRadius: 12,
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🔋</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#ca8a04" }}>BurnoutIQ</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{burnoutEvents.length} contacts showing burnout patterns</div>
                </div>
                <Link href="/signals" style={{ marginLeft: "auto", fontSize: 11, color: "#ca8a04", textDecoration: "none", fontWeight: 600 }}>
                  View all →
                </Link>
              </div>
              {burnoutEvents.slice(0, 3).map(e => (
                <Link key={e.id} href={`/prospects/${e.contactId}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "7px 10px", borderRadius: 8, marginBottom: 4,
                    background: "rgba(234,179,8,0.06)",
                    fontSize: 12, color: "var(--text-1)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(234,179,8,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(234,179,8,0.06)")}
                  >
                    <span style={{ fontWeight: 600, color: "var(--text-0)" }}>{e.contactName}</span>
                    <span style={{ color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Quiet state · approach with care
                    </span>
                    <span style={{ fontSize: 10, color: "#ca8a04", fontWeight: 700, flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

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
            : sorted.map(p => <ProspectRow key={p.id} p={p} onOpen={setModal} />)}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Signal Feed</div>
              <div className="card-sub">Signals, pressure & burnout events</div>
            </div>
            <Link href="/signals" className="micro-btn">Full feed</Link>
          </div>
          {homeEvents.length === 0 ? (
            <div className="empty" style={{ padding: "16px 20px", color: "var(--text-2)", fontSize: 13 }}>
              Loading feed…
            </div>
          ) : homeEvents.map(f => (
            <div className="feed-item" key={f.id}>
              <div className="feed-icon">{f.icon}</div>
              <div className="feed-body" style={{ flex: 1 }}>
                <div className="feed-text" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span dangerouslySetInnerHTML={{ __html: f.html }} />
                  {TYPE_LABELS[f.type] && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      padding: "2px 6px", borderRadius: 4,
                      background: (TYPE_COLORS[f.type] ?? "var(--accent)") + "22",
                      color: TYPE_COLORS[f.type] ?? "var(--accent)",
                      letterSpacing: "0.03em", flexShrink: 0,
                    }}>
                      {TYPE_LABELS[f.type]}
                    </span>
                  )}
                </div>
                <div className="feed-meta">{f.meta}</div>
              </div>
              <Link className="micro-btn" href={`/prospects/${f.contactId}`}>Open</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-strip">
        <div>
          <h3>SignalIQ · Pivot Training</h3>
          <p>
            {(source === "supabase" || source === "airtable")
              ? "Cloud synced · Chris & Jazmine share one source of truth · Signal Scores update automatically"
              : "Built on polyvagal theory. Engineered in Cleveland and Atlanta."}
          </p>
        </div>
      </div>
    </>
  );
}
