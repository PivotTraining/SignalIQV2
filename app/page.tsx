import Link from "next/link";
import ProspectRow from "@/components/ProspectRow";
import { feed, kpis, prospects } from "@/lib/data";
import { rScore } from "@/lib/rscore";

export default function CommandCenter() {
  const k = kpis();
  const today = [...prospects]
    .sort((a, b) => rScore(b) - rScore(a))
    .slice(0, 5);

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1>Good morning, Chris.</h1>
          <p>3 prospects in active state. 1 needs a pattern interrupt. 1 ready for the ask.</p>
        </div>
        <div className="topbar-actions">
          <div className="pill"><span className="pill-dot" />NSS engine live</div>
          <button className="btn">Import list</button>
          <button className="btn btn-primary">Run signal sweep</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Active Pipeline</div>
          <div className="kpi-value">${k.pipeline.toLocaleString()}</div>
          <div className="kpi-delta">▲ 28% vs last week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Ventral Vagal %</div>
          <div className="kpi-value">{k.ventralPct}%</div>
          <div className="kpi-delta">▲ 9pts — healthy zone</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Meetings Booked</div>
          <div className="kpi-value">{k.meetingsBooked}</div>
          <div className="kpi-delta">▲ 6 this week</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg R-Score</div>
          <div className="kpi-value">{k.avgR}</div>
          <div className="kpi-delta down">▼ 2.1 — refresh signals</div>
        </div>
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
          {today.map(p => <ProspectRow key={p.id} p={p} />)}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Signal Feed</div>
              <div className="card-sub">Stream of state changes and intent events</div>
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
          <p>Built on polyvagal theory. Executed through autonomous agents. Engineered in Cleveland and Atlanta.</p>
        </div>
        <button className="btn btn-primary">Book a demo</button>
      </div>
    </>
  );
}
