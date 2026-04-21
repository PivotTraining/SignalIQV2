"use client";
import { useRef, useState } from "react";
import ProspectRow from "@/components/ProspectRow";
import ProspectModal from "@/components/ProspectModal";
import AddContactModal from "@/components/AddContactModal";
import { useProspects } from "@/lib/useProspects";
import { rScore } from "@/lib/rscore";
import type { Prospect } from "@/lib/types";

type SortKey = "signal" | "rscore" | "name" | "company" | "lastTouch" | "intent";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "signal",    label: "Signal Score" },
  { key: "rscore",    label: "R-Score" },
  { key: "name",      label: "Name A–Z" },
  { key: "company",   label: "Company" },
  { key: "lastTouch", label: "Last Touch" },
  { key: "intent",    label: "Intent" },
];

function sortProspects(prospects: Prospect[], key: SortKey, dir: SortDir): Prospect[] {
  const sorted = [...prospects].sort((a, b) => {
    let va: number | string, vb: number | string;
    switch (key) {
      case "signal":    va = a.signalStack;       vb = b.signalStack;       break;
      case "rscore":    va = rScore(a);           vb = rScore(b);           break;
      case "name":      va = a.name.toLowerCase();vb = b.name.toLowerCase();break;
      case "company":   va = a.company.toLowerCase(); vb = b.company.toLowerCase(); break;
      case "lastTouch": va = a.lastTouchDaysAgo;  vb = b.lastTouchDaysAgo;  break;
      case "intent":    va = a.intentVelocity;    vb = b.intentVelocity;    break;
    }
    if (va < vb) return -1;
    if (va > vb) return  1;
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export default function ProspectsPage() {
  const { prospects, source, refetch } = useProspects();
  const [sweeping, setSweeping] = useState(false);
  const [sweepMsg, setSweepMsg] = useState("");
  const [sortKey, setSortKey]   = useState<SortKey>("signal");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [modal, setModal]         = useState<Prospect | null>(null);
  const [addOpen, setAddOpen]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = sortProspects(prospects, sortKey, sortDir);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      // Name/company default asc; scores default desc; lastTouch default asc
      setSortDir(key === "name" || key === "company" ? "asc" : key === "lastTouch" ? "asc" : "desc");
    }
  }

  async function runSignalSweep() {
    setSweeping(true);
    setSweepMsg("Recalculating scores…");
    try {
      const res  = await fetch("/api/signal-sweep", { method: "POST" });
      const json = await res.json() as { updated?: number };
      setSweepMsg(`✓ ${json.updated ?? 0} scores updated`);
      await refetch();
    } catch {
      setSweepMsg("Sweep failed — try again");
    } finally {
      setSweeping(false);
      setTimeout(() => setSweepMsg(""), 4000);
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
      setSweepMsg(`✓ ${json.inserted ?? 0} contacts imported`);
      await refetch();
      setTimeout(() => setSweepMsg(""), 4000);
    }
    e.target.value = "";
  }

  return (
    <>
      {/* Modals */}
      {modal && <ProspectModal prospect={modal} onClose={() => setModal(null)} />}
      {addOpen && (
        <AddContactModal
          onClose={() => setAddOpen(false)}
          onSaved={msg => { setSweepMsg(msg); refetch(); setTimeout(() => setSweepMsg(""), 4000); }}
        />
      )}

      {/* Top bar */}
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Prospects</h1>
          <p className="page-sub">
            {source === "supabase"
              ? `${prospects.length} accounts · Live from Supabase`
              : source === "loading" ? "Loading…"
              : `${prospects.length} accounts`}
          </p>
        </div>
        <div className="topbar-actions">
          {sweepMsg && (
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{sweepMsg}</span>
          )}
          <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleImport} />
          <button className="btn" onClick={() => fileRef.current?.click()}>Import list</button>
          <button className="btn" onClick={() => setAddOpen(true)}>+ Add contact</button>
          <button className="btn btn-primary" onClick={runSignalSweep} disabled={sweeping}>
            {sweeping ? "Sweeping…" : "Run signal sweep"}
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>
          Sort:
        </span>
        {SORT_OPTIONS.map(opt => {
          const active = sortKey === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => toggleSort(opt.key)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                cursor: "pointer",
                border: `1px solid ${active ? "var(--accent)" : "var(--line-2)"}`,
                background: active ? "var(--accent)" : "var(--bg-2)",
                color: active ? "#fff" : "var(--text-2)",
                fontWeight: active ? 600 : 400,
                display: "flex", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}
            >
              {opt.label}
              {active && (
                <span style={{ fontSize: 10 }}>{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-3)" }}>
          {sorted.length} contacts
        </span>
      </div>

      {/* Prospects list */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All prospects</div>
            <div className="card-sub">Click a row to open detail · Act button opens quick panel</div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "3fr 1.2fr 0.9fr 1.4fr 90px",
          gap: 16,
          padding: "8px 20px",
          borderBottom: "1px solid var(--line)",
          fontSize: 10.5,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-3)",
        }}>
          {[
            { label: "Contact",   key: "name"      as SortKey },
            { label: "NSS State", key: null },
            { label: "R-Score",   key: "rscore"    as SortKey },
            { label: "Next Move", key: null },
            { label: "",          key: null },
          ].map((col, i) => (
            <div
              key={i}
              style={{ cursor: col.key ? "pointer" : "default", userSelect: "none",
                color: col.key && sortKey === col.key ? "var(--accent)" : undefined }}
              onClick={() => col.key && toggleSort(col.key)}
            >
              {col.label}
              {col.key && sortKey === col.key && (
                <span style={{ marginLeft: 3 }}>{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </div>
          ))}
        </div>

        {source === "loading"
          ? <div className="empty">Loading prospects…</div>
          : sorted.length === 0
          ? <div className="empty">No prospects yet — import a list to get started.</div>
          : sorted.map(p => (
              <ProspectRow key={p.id} p={p} onAct={setModal} />
            ))}
      </div>
    </>
  );
}
