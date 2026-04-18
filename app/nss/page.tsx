import Link from "next/link";
import { prospects } from "@/lib/data";
import { stateCode, stateLabel } from "@/lib/nss";

export default function NSSMonitor() {
  const byState = {
    ventral: prospects.filter(p => p.state === "ventral"),
    sympathetic: prospects.filter(p => p.state === "sympathetic"),
    dorsal: prospects.filter(p => p.state === "dorsal"),
  };

  const total = prospects.length;

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">NSS Monitor</h1>
          <p className="page-sub">Polyvagal distribution across your book. Engine trained on your labeled interactions.</p>
        </div>
      </div>

      <div className="kpi-grid">
        {(["ventral", "sympathetic", "dorsal"] as const).map(s => {
          const pct = Math.round(100 * byState[s].length / total);
          return (
            <div className="kpi" key={s}>
              <div className="kpi-label">{stateLabel[s]}</div>
              <div className="kpi-value">{byState[s].length}</div>
              <div className="kpi-delta">{pct}% of book</div>
            </div>
          );
        })}
        <div className="kpi">
          <div className="kpi-label">Model confidence avg</div>
          <div className="kpi-value">0.72</div>
          <div className="kpi-delta">▲ 0.04 this week</div>
        </div>
      </div>

      <div className="list-col">
        {(["ventral", "sympathetic", "dorsal"] as const).map(s => (
          <div className="card" key={s}>
            <div className="card-header">
              <div>
                <div className="card-title">{stateLabel[s]}</div>
                <div className="card-sub">{byState[s].length} prospects currently in this state</div>
              </div>
              <span className={`state-badge ${stateCode[s]}`}>
                <span className="state-dot" />
                {byState[s].length}
              </span>
            </div>
            {byState[s].length === 0 ? (
              <div className="empty">No prospects in this state</div>
            ) : byState[s].map(p => (
              <Link key={p.id} href={`/prospects/${p.id}`} className="feed-item">
                <div className={`avatar ${stateCode[s]}`}>{p.initials}</div>
                <div className="feed-body">
                  <div className="feed-text"><strong>{p.name}</strong> · {p.company}</div>
                  <div className="feed-meta">
                    confidence {(p.stateConfidence[s] * 100).toFixed(0)}% · last touch {p.lastTouchDaysAgo}d ago
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
