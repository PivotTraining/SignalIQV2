"use client";
import { useEffect, useState, useRef } from "react";
import { useProspects } from "@/lib/useProspects";
import { rScore } from "@/lib/rscore";
import { stateLabel, stateCode } from "@/lib/nss";
import type { SequenceDef } from "@/lib/sequences";
import type { Prospect } from "@/lib/types";

interface Props {
  sequence: SequenceDef;
  onEnroll: (prospect: Prospect) => Promise<void>;
  onClose: () => void;
}

export default function ProspectPicker({ sequence, onEnroll, onClose }: Props) {
  const { prospects } = useProspects();
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const filtered = prospects
    .filter(p => {
      if (!query) return true;
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q);
    })
    .sort((a, b) => rScore(b) - rScore(a))
    .slice(0, 30);

  async function handleEnroll(p: Prospect) {
    setLoading(p.id);
    try { await onEnroll(p); }
    finally { setLoading(null); }
  }

  const STATE_COLOR: Record<string, string> = {
    ventral:     "#22c55e",
    sympathetic: "#f97316",
    dorsal:      "#8b5cf6",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--bg-1)", borderRadius: 16,
        border: "1px solid var(--line-2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
        maxHeight: "80vh",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{sequence.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>
                Enroll in: {sequence.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                {sequence.steps.length} steps · entry state: <span style={{ color: sequence.color, fontWeight: 600 }}>{stateLabel[sequence.targetEntry]}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
                fontSize: 18, color: "var(--text-3)", lineHeight: 1, padding: 4 }}
            >
              ✕
            </button>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or company…"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8,
              border: "1px solid var(--line-2)", background: "var(--bg-2)",
              color: "var(--text-0)", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Prospect list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
              No matches found.
            </div>
          ) : filtered.map(p => {
            const code  = stateCode[p.state];
            const color = STATE_COLOR[p.state] ?? "var(--text-3)";
            const r     = Math.round(rScore(p));
            const isLoading = loading === p.id;

            return (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 20px", cursor: "pointer",
                  borderBottom: "1px solid var(--line)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => !isLoading && handleEnroll(p)}
              >
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                  border: `1.5px solid ${color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color,
                }}>
                  {p.initials || p.name[0]}
                </div>

                {/* Name + company */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", marginBottom: 2 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title} · {p.company}
                  </div>
                </div>

                {/* State badge */}
                <span className={`state-badge ${code}`} style={{ fontSize: 11, flexShrink: 0 }}>
                  <span className="state-dot" />
                  {stateLabel[p.state]}
                </span>

                {/* R-Score */}
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "var(--text-3)",
                  background: "var(--bg-3)", borderRadius: 4, padding: "2px 6px",
                  flexShrink: 0,
                }}>
                  {r}
                </span>

                {/* Enroll button */}
                <button
                  className="micro-btn"
                  style={{ flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
                  onClick={e => { e.stopPropagation(); !isLoading && handleEnroll(p); }}
                >
                  {isLoading ? "…" : "Enroll"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
