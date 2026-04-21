"use client";
import Link from "next/link";
import { useProspects } from "@/lib/useProspects";
import { stateCode, stateLabel } from "@/lib/nss";
import type { NSS } from "@/lib/types";

export default function NSSMonitor() {
  const { prospects, source } = useProspects();

  const byState: Record<NSS, typeof prospects> = {
    ventral:     prospects.filter(p => p.state === "ventral"),
    sympathetic: prospects.filter(p => p.state === "sympathetic"),
    dorsal:      prospects.filter(p => p.state === "dorsal"),
  };

  const total = prospects.length || 1;

  // Avg confidence per state
  const avgConf = (state: NSS) => {
    const group = byState[state];
    if (!group.length) return 0;
    return Math.round(100 * group.reduce((s, p) => s + (p.stateConfidence[state] ?? 0), 0) / group.length);
  };

  const loading = source === "loading";

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">NSS Monitor</h1>
          <p className="page-sub">
            {loading
              ? "Loading…"
              : `Polyvagal distribution · ${prospects.length} contacts · ${source === "supabase" ? "live from Supabase" : "seed data"}`}
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        {(["ventral", "sympathetic", "dorsal"] as const).map(s => {
          const pct = Math.round(100 * byState[s].length / total);
          return (
            <div className="kpi" key={s}>
              <div className="kpi-label">{stateLabel[s]}</div>
              <div className="kpi-value">{loading ? "—" : byState[s].length}</div>
              <div className="kpi-delta">{loading ? "" : `${pct}% of book`}</div>
            </div>
          );
        })}
        <div className="kpi">
          <div className="kpi-label">Avg model confidence</div>
          <div className="kpi-value">
            {loading ? "—" : `${Math.round((avgConf("ventral") + avgConf("sympathetic") + avgConf("dorsal")) / 3)}%`}
          </div>
          <div className="kpi-delta">across all 3 states</div>
        </div>
      </div>

      {/* Score band breakdown */}
      {!loading && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Signal score distribution</div>
              <div className="card-sub">How your book is distributed across signal bands</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0, height: 12, borderRadius: 6, overflow: "hidden", margin: "16px 20px" }}>
            {[
              { label: "Hot ≥80", count: prospects.filter(p => p.signalStack >= 80).length, color: "#f97316" },
              { label: "Warm ≥60", count: prospects.filter(p => p.signalStack >= 60 && p.signalStack < 80).length, color: "#eab308" },
              { label: "Cooling ≥40", count: prospects.filter(p => p.signalStack >= 40 && p.signalStack < 60).length, color: "#6366f1" },
              { label: "Cold ≥20", count: prospects.filter(p => p.signalStack >= 20 && p.signalStack < 40).length, color: "#64748b" },
            ].map(band => (
              <div
                key={band.label}
                style={{ flex: band.count, background: band.color, opacity: 0.85 }}
                title={`${band.label}: ${band.count} contacts`}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, padding: "0 20px 16px", flexWrap: "wrap" }}>
            {[
              { label: "🔥 Hot", count: prospects.filter(p => p.signalStack >= 80).length, color: "#f97316" },
              { label: "⚡ Warm", count: prospects.filter(p => p.signalStack >= 60 && p.signalStack < 80).length, color: "#eab308" },
              { label: "🌡 Cooling", count: prospects.filter(p => p.signalStack >= 40 && p.signalStack < 60).length, color: "#6366f1" },
              { label: "❄️ Cold", count: prospects.filter(p => p.signalStack >= 20 && p.signalStack < 40).length, color: "#64748b" },
            ].map(band => (
              <div key={band.label} style={{ fontSize: 13 }}>
                <span style={{ color: band.color, fontWeight: 600 }}>{band.count}</span>
                <span style={{ color: "var(--text-2)", marginLeft: 4 }}>{band.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="list-col">
        {(["ventral", "sympathetic", "dorsal"] as const).map(s => (
          <div className="card" key={s}>
            <div className="card-header">
              <div>
                <div className="card-title">{stateLabel[s]}</div>
                <div className="card-sub">
                  {loading
                    ? "Loading…"
                    : `${byState[s].length} prospects · avg confidence ${avgConf(s)}%`}
                </div>
              </div>
              <span className={`state-badge ${stateCode[s]}`}>
                <span className="state-dot" />
                {loading ? "—" : byState[s].length}
              </span>
            </div>

            {loading ? (
              <div className="empty">Loading…</div>
            ) : byState[s].length === 0 ? (
              <div className="empty">No prospects in this state</div>
            ) : byState[s]
                .sort((a, b) => (b.stateConfidence[s] ?? 0) - (a.stateConfidence[s] ?? 0))
                .slice(0, 12)
                .map(p => (
              <Link key={p.id} href={`/prospects/${p.id}`} className="feed-item">
                <div className={`avatar ${stateCode[s]}`}>{p.initials}</div>
                <div className="feed-body">
                  <div className="feed-text">
                    <strong>{p.name}</strong> · {p.company}
                  </div>
                  <div className="feed-meta">
                    confidence {((p.stateConfidence[s] ?? 0) * 100).toFixed(0)}%
                    · signal {p.signalStack}
                    · last touch {p.lastTouchDaysAgo}d ago
                  </div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontFamily: "SF Mono, Menlo, monospace",
                  color: p.signalStack >= 80 ? "#f97316" : p.signalStack >= 60 ? "#eab308" : "var(--text-2)",
                  fontWeight: 600,
                }}>
                  {p.signalStack}
                </span>
              </Link>
            ))}

            {byState[s].length > 12 && (
              <div style={{ padding: "10px 20px", fontSize: 12, color: "var(--text-2)" }}>
                + {byState[s].length - 12} more — go to Prospects for the full list
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
