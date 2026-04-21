"use client";
import { useRef, useState } from "react";
import ProspectRow from "@/components/ProspectRow";
import ProspectModal from "@/components/ProspectModal";
import AddContactModal from "@/components/AddContactModal";
import { useProspects } from "@/lib/useProspects";
import { useFavorites } from "@/lib/useFavorites";
import { rScore } from "@/lib/rscore";
import type { Prospect } from "@/lib/types";

type SortKey = "signal" | "rscore" | "name" | "company" | "lastTouch" | "intent";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "signal",    label: "Signal Score" },
  { key: "rscore",    label: "Priority" },
  { key: "name",      label: "Name A–Z" },
  { key: "company",   label: "Company" },
  { key: "lastTouch", label: "Last Touch" },
  { key: "intent",    label: "Intent" },
];

function sortProspects(prospects: Prospect[], key: SortKey, dir: SortDir): Prospect[] {
  const sorted = [...prospects].sort((a, b) => {
    let va: number | string, vb: number | string;
    switch (key) {
      case "signal":    va = a.signalStack;        vb = b.signalStack;        break;
      case "rscore":    va = rScore(a);            vb = rScore(b);            break;
      case "name":      va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case "company":   va = a.company.toLowerCase(); vb = b.company.toLowerCase(); break;
      case "lastTouch": va = a.lastTouchDaysAgo;   vb = b.lastTouchDaysAgo;   break;
      case "intent":    va = a.intentVelocity;     vb = b.intentVelocity;     break;
    }
    if (va < vb) return -1;
    if (va > vb) return  1;
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export default function ProspectsPage() {
  const { prospects, source, refetch }    = useProspects();
  const { isFavorite, toggleFavorite }    = useFavorites();
  const [sweeping, setSweeping]           = useState(false);
  const [sweepMsg, setSweepMsg]           = useState("");
  const [sortKey, setSortKey]             = useState<SortKey>("rscore");
  const [sortDir, setSortDir]             = useState<SortDir>("desc");
  const [modal, setModal]                 = useState<Prospect | null>(null);
  const [addOpen, setAddOpen]             = useState(false);
  const [search, setSearch]               = useState("");
  const [favsOnly, setFavsOnly]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sort → search filter → favorites filter
  const sorted   = sortProspects(prospects, sortKey, sortDir);
  const searched = search.trim()
    ? sorted.filter(p => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          (p.title     ?? "").toLowerCase().includes(q) ||
          (p.industry  ?? "").toLowerCase().includes(q)
        );
      })
    : sorted;
  // Favorites pinned to top, then rest
  const display = favsOnly
    ? searched.filter(p => isFavorite(p.id))
    : [
        ...searched.filter(p =>  isFavorite(p.id)),
        ...searched.filter(p => !isFavorite(p.id)),
      ];

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
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

  const favCount = prospects.filter(p => isFavorite(p.id)).length;

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
              ? `${prospects.length} contacts · Live from Supabase`
              : source === "loading" ? "Loading…"
              : `${prospects.length} contacts`}
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

      {/* Search + favorites row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "var(--text-3)", pointerEvents: "none",
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name, company, title, industry…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 36px 9px 34px",
              borderRadius: 10, border: "1px solid var(--line-2)",
              background: "var(--bg-2)", color: "var(--text-0)",
              fontSize: 13.5, outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e  => (e.target.style.borderColor = "var(--line-2)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-3)", fontSize: 17, lineHeight: 1, padding: "2px 4px",
              }}
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setFavsOnly(f => !f)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "8px 14px", borderRadius: 10, border: "1px solid",
            borderColor: favsOnly ? "rgba(245,158,11,0.5)" : "var(--line-2)",
            background: favsOnly ? "rgba(245,158,11,0.08)" : "var(--bg-2)",
            color: favsOnly ? "#f59e0b" : "var(--text-2)",
            fontSize: 12.5, fontWeight: favsOnly ? 600 : 400, cursor: "pointer",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}
        >
          <span>{favsOnly ? "★" : "☆"}</span>
          Favorites{favCount > 0 && <span style={{ opacity: 0.7 }}> · {favCount}</span>}
        </button>
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
                padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: `1px solid ${active ? "var(--accent)" : "var(--line-2)"}`,
                background: active ? "var(--accent)" : "var(--bg-2)",
                color: active ? "#fff" : "var(--text-2)",
                fontWeight: active ? 600 : 400,
                display: "flex", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}
            >
              {opt.label}
              {active && <span style={{ fontSize: 10 }}>{sortDir === "desc" ? "↓" : "↑"}</span>}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-3)" }}>
          {display.length}{display.length !== prospects.length ? ` of ${prospects.length}` : ""} contacts
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
          gap: 16, padding: "8px 20px",
          borderBottom: "1px solid var(--line)",
          fontSize: 10.5, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--text-3)",
        }}>
          {[
            { label: "Contact",   key: "name"    as SortKey },
            { label: "NSS State", key: null },
            { label: "Priority",  key: "rscore"  as SortKey },
            { label: "Next Move", key: null },
            { label: "",          key: null },
          ].map((col, i) => (
            <div
              key={i}
              style={{
                cursor: col.key ? "pointer" : "default",
                userSelect: "none",
                color: col.key && sortKey === col.key ? "var(--accent)" : undefined,
              }}
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
          : display.length === 0 && search
          ? <div className="empty">No contacts match "{search}"</div>
          : display.length === 0 && favsOnly
          ? <div className="empty">No favorites yet — star a contact to pin them here.</div>
          : display.length === 0
          ? <div className="empty">No prospects yet — import a list to get started.</div>
          : display.map(p => (
              <ProspectRow
                key={p.id}
                p={p}
                onAct={setModal}
                isFavorited={isFavorite(p.id)}
                onFavorite={toggleFavorite}
              />
            ))}
      </div>
    </>
  );
}
