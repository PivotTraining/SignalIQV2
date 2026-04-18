import ProspectRow from "@/components/ProspectRow";
import { prospects } from "@/lib/data";
import { rScore } from "@/lib/rscore";

export default function ProspectsPage() {
  const sorted = [...prospects].sort((a, b) => rScore(b) - rScore(a));
  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Prospects</h1>
          <p className="page-sub">{prospects.length} accounts in your book. Sorted by R-Score.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn">Import list</button>
          <button className="btn btn-primary">Run signal sweep</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All prospects</div>
            <div className="card-sub">Click any row to open the prospect detail</div>
          </div>
        </div>
        {sorted.map(p => <ProspectRow key={p.id} p={p} />)}
      </div>
    </>
  );
}
