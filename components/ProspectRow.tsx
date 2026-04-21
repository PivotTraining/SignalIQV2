"use client";
import Link from "next/link";
import type { Prospect } from "@/lib/types";
import { stateCode } from "@/lib/nss";
import { rBand, rScore } from "@/lib/rscore";
import StateBadge from "./StateBadge";

interface Props {
  p:            Prospect;
  onAct?:       (p: Prospect) => void;
  isFavorited?: boolean;
  onFavorite?:  (id: string) => void;
}

const PRIORITY: Record<string, { label: string; bg: string; color: string }> = {
  high: { label: "High",   bg: "rgba(34,197,94,0.12)",   color: "#22c55e" },
  mid:  { label: "Mid",    bg: "rgba(234,179,8,0.10)",   color: "#ca8a04" },
  low:  { label: "Low",    bg: "rgba(148,163,184,0.10)", color: "#64748b" },
};

export default function ProspectRow({ p, onAct, isFavorited, onFavorite }: Props) {
  const r        = rScore(p);
  const band     = rBand(r);
  const code     = stateCode[p.state];
  const priority = PRIORITY[band] ?? PRIORITY.low;

  return (
    <div className="prospect-row" style={{ display: "grid", position: "relative" }}>

      {/* Clickable overlay for row navigation */}
      <Link
        href={`/prospects/${p.id}`}
        style={{ position: "absolute", inset: 0, display: "block", zIndex: 0 }}
        aria-label={`Open ${p.name} detail`}
        tabIndex={-1}
      />

      {/* Contact column — star + avatar + name */}
      <div className="person" style={{ position: "relative", zIndex: 1 }}>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onFavorite?.(p.id); }}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 15, padding: "0 4px 0 0", flexShrink: 0,
            color: isFavorited ? "#f59e0b" : "var(--text-3)",
            opacity: isFavorited ? 1 : 0.35,
            transition: "opacity 0.15s, color 0.15s",
            lineHeight: 1,
          }}
        >
          {isFavorited ? "★" : "☆"}
        </button>
        <div className={`avatar ${code}`}>{p.initials}</div>
        <div>
          <div className="person-name">{p.name}</div>
          <div className="person-sub">{p.title} · {p.company}</div>
        </div>
      </div>

      {/* NSS state */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <StateBadge state={p.state} />
      </div>

      {/* Priority badge — simplified from raw R-Score number */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "3px 10px", borderRadius: 20,
          fontSize: 11.5, fontWeight: 600,
          background: priority.bg, color: priority.color,
        }}>
          {priority.label}
        </span>
      </div>

      {/* Next move */}
      <div className="next-move" style={{ position: "relative", zIndex: 1 }}>
        {p.nextMove?.slice(0, 60)}{p.nextMove && p.nextMove.length > 60 ? "…" : ""}
      </div>

      {/* Act button */}
      <button
        className="micro-btn"
        style={{ position: "relative", zIndex: 2 }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          if (onAct) {
            onAct(p);
          } else {
            window.location.href = `/prospects/${p.id}`;
          }
        }}
      >
        Act
      </button>
    </div>
  );
}
