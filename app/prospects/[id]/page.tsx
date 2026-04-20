import { notFound } from "next/navigation";
import Composer from "@/components/Composer";
import Ladder from "@/components/Ladder";
import StateBadge from "@/components/StateBadge";
import LogInteraction from "@/components/LogInteraction";
import SignalScoreBadge from "@/components/SignalScoreBadge";
import { getProspect, prospects } from "@/lib/data";
import { forbiddenFor, nextMoveFor, stateCode, stateLabel } from "@/lib/nss";
import { rBand, rScore } from "@/lib/rscore";
import { calcSignalScore } from "@/lib/scoring";

export function generateStaticParams() {
  return prospects.map(p => ({ id: p.id }));
}

export default function ProspectDetail({ params }: { params: { id: string } }) {
  const p = getProspect(params.id);
  if (!p) return notFound();

  const r = rScore(p);
  const band = rBand(r);
  const code = stateCode[p.state];

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">{p.name}</h1>
          <p className="page-sub">{p.title} · {p.company} · {p.headcount} employees · {p.industry}</p>
        </div>
        <div className="topbar-actions">
          <StateBadge state={p.state} />
          <div className="pill">R-Score <strong style={{ marginLeft: 6 }} className={`rscore ${band}`}>{Math.round(r)}</strong></div>
          <SignalScoreBadge score={calcSignalScore({ lastTouchDaysAgo: p.lastTouchDaysAgo, interactions90d: p.interactions.length, avgDepth: 3, intent: p.intentVelocity })} />
          <button className="btn">Export</button>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Nervous system state</div>
              <div className="card-sub">Live polyvagal read with confidence bands</div>
            </div>
            <span className={`state-badge ${code}`}><span className="state-dot" />{stateLabel[p.state]}</span>
          </div>
          <div className="nss-viz">
            <Ladder c={p.stateConfidence} />

            <div className="signals">
              {p.signals.map((s, i) => (
                <div className="signal" key={i}>
                  <div className="signal-label">{s.label}</div>
                  <div className="signal-value">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="verdict">
              <div className="verdict-label">Recommended next move</div>
              <div className="verdict-body">
                <strong>{nextMoveFor[p.state]}</strong><br />
                <span style={{ color: "var(--text-2)" }}>Forbidden: {forbiddenFor[p.state]}</span>
              </div>
            </div>
          </div>
          <Composer prospect={p} />
          <LogInteraction contactId={p.id} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">R-Score breakdown</div>
                <div className="card-sub">{Math.round(r)} composite · {band === "high" ? "Active sequence" : band === "mid" ? "Nurture" : "Deprioritized"}</div>
              </div>
            </div>
            <div className="card-body">
              <ScoreBar label="Signal stack (0.25)" value={p.signalStack} />
              <ScoreBar label="Intent velocity (0.20)" value={p.intentVelocity} />
              <ScoreBar label="Budget indicator (0.15)" value={p.budgetIndicator} />
              <ScoreBar label="Authority match (0.15)" value={p.authorityMatch} />
              <ScoreBar label="Timing window (0.15)" value={p.timingWindow} />
              <ScoreBar label="Social proof (0.10)" value={p.socialProofAlignment} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Interaction history</div>
                <div className="card-sub">{p.interactions.length} touches · last {p.lastTouchDaysAgo}d ago</div>
              </div>
            </div>
            {p.interactions.map(i => (
              <div className="feed-item" key={i.id}>
                <div className="feed-icon">{i.direction === "in" ? "◀" : "▶"}</div>
                <div className="feed-body">
                  <div className="feed-text">{i.body}</div>
                  <div className="feed-meta">
                    {i.direction === "in" ? "Reply" : "Sent"} · {i.channel} · {i.at}
                    {i.latencyHours != null ? ` · ${i.latencyHours}h latency` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "var(--text-2)" }}>{label}</span>
        <span style={{ fontFamily: "SF Mono, Menlo, monospace", color: "var(--text-0)" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${value}%`, height: "100%",
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
        }} />
      </div>
    </div>
  );
}
