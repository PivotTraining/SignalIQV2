import Link from "next/link";
import { feed } from "@/lib/data";

export default function SignalFeedPage() {
  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Signal Feed</h1>
          <p className="page-sub">Every state change, intent event, and model update in one stream.</p>
        </div>
        <div className="topbar-actions">
          <div className="pill"><span className="pill-dot" />Live</div>
          <button className="btn">Filter</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All signals</div>
            <div className="card-sub">{feed.length} events in the last 24 hours</div>
          </div>
        </div>
        {feed.map(f => (
          <div className="feed-item" key={f.id}>
            <div className="feed-icon">{f.icon}</div>
            <div className="feed-body">
              <div className="feed-text" dangerouslySetInnerHTML={{ __html: f.html }} />
              <div className="feed-meta">{f.meta}</div>
            </div>
            {f.prospectId ? (
              <Link className="micro-btn" href={`/prospects/${f.prospectId}`}>Open</Link>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
