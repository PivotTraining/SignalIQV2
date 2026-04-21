"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { FeedEvent } from "@/app/api/feed/route";

const TYPE_LABELS: Record<string, string> = {
  "signal-alert": "Alert",
  "pressure":     "PressureIQ",
  "burnout":      "BurnoutIQ",
  "outreach":     "Outreach",
  "re-engage":    "Re-engage",
  "score-update": "Score",
};

const TYPE_COLORS: Record<string, string> = {
  "signal-alert": "#f97316",
  "pressure":     "#ef4444",
  "burnout":      "#eab308",
  "outreach":     "var(--accent)",
  "re-engage":    "#a855f7",
  "score-update": "#22c55e",
};

const TYPE_DESC: Record<string, string> = {
  "pressure": "Institutional pressure signals — budget windows, mandates, leadership changes",
  "burnout":  "Staff burnout patterns — quiet state contacts who need a low-ask approach",
};

export default function SignalFeedPage() {
  const [events, setEvents]   = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>("all");

  useEffect(() => {
    fetch("/api/feed")
      .then(r => r.json())
      .then((d: { events: FeedEvent[] }) => { setEvents(d.events); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const FILTERS = ["all", "pressure", "burnout", "signal-alert", "outreach", "re-engage"];
  const shown   = filter === "all" ? events : events.filter(e => e.type === filter);

  const pressureCount = events.filter(e => e.type === "pressure").length;
  const burnoutCount  = events.filter(e => e.type === "burnout").length;

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Signal Feed</h1>
          <p className="page-sub">
            {loading
              ? "Loading events…"
              : `${events.length} events · ${pressureCount} pressure · ${burnoutCount} burnout · live from Supabase`}
          </p>
        </div>
        <div className="topbar-actions">
          <div className="pill"><span className="pill-dot" />Live</div>
        </div>
      </div>

      {/* Intelligence summary strip */}
      {!loading && (pressureCount > 0 || burnoutCount > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {pressureCount > 0 && (
            <button
              onClick={() => setFilter(filter === "pressure" ? "all" : "pressure")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                background: filter === "pressure" ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${filter === "pressure" ? "#ef4444" : "rgba(239,68,68,0.2)"}`,
                flex: 1, minWidth: 220, textAlign: "left",
              }}
            >
              <span style={{ fontSize: 22 }}>🎯</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#ef4444" }}>PressureIQ</div>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>{pressureCount} schools with institutional pressure signals</div>
              </div>
            </button>
          )}
          {burnoutCount > 0 && (
            <button
              onClick={() => setFilter(filter === "burnout" ? "all" : "burnout")}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                background: filter === "burnout" ? "rgba(234,179,8,0.12)" : "rgba(234,179,8,0.05)",
                border: `1px solid ${filter === "burnout" ? "#eab308" : "rgba(234,179,8,0.2)"}`,
                flex: 1, minWidth: 220, textAlign: "left",
              }}
            >
              <span style={{ fontSize: 22 }}>🔋</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#ca8a04" }}>BurnoutIQ</div>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>{burnoutCount} contacts in quiet / burnout state</div>
              </div>
            </button>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              {filter === "all" ? "All signals" : TYPE_LABELS[filter] ?? filter}
            </div>
            <div className="card-sub">
              {TYPE_DESC[filter] ?? `${shown.length} events`}
            </div>
          </div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(t => {
              const count = t === "all" ? events.length : events.filter(e => e.type === t).length;
              if (t !== "all" && count === 0) return null;
              const color = TYPE_COLORS[t];
              const active = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    fontWeight: active ? 700 : 500,
                    background: active && color ? color + "22" : active ? "var(--bg-3)" : "transparent",
                    border: `1px solid ${active && color ? color : "var(--line-2)"}`,
                    color: active && color ? color : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {t === "all" ? "All" : TYPE_LABELS[t]}
                  {t !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="empty" style={{ padding: 32, textAlign: "center" }}>
            Loading signal feed…
          </div>
        ) : shown.length === 0 ? (
          <div className="empty" style={{ padding: 32, textAlign: "center" }}>
            No events match this filter.
          </div>
        ) : shown.map(f => (
          <div className="feed-item" key={f.id}>
            <div className="feed-icon">{f.icon}</div>
            <div className="feed-body" style={{ flex: 1 }}>
              <div className="feed-text" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span dangerouslySetInnerHTML={{ __html: f.html }} />
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  padding: "2px 6px", borderRadius: 4,
                  background: (TYPE_COLORS[f.type] ?? "var(--accent)") + "22",
                  color: TYPE_COLORS[f.type] ?? "var(--accent)",
                  letterSpacing: "0.03em", flexShrink: 0,
                }}>
                  {TYPE_LABELS[f.type]}
                </span>
              </div>
              <div className="feed-meta">{f.meta}</div>
            </div>
            <Link className="micro-btn" href={`/prospects/${f.contactId}`}>Open</Link>
          </div>
        ))}
      </div>
    </>
  );
}
