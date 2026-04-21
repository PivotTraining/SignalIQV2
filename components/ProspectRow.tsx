"use client";
import Link from "next/link";
import type { Prospect } from "@/lib/types";
import { stateCode } from "@/lib/nss";
import { rBand, rScore } from "@/lib/rscore";
import StateBadge from "./StateBadge";

interface Props {
  p: Prospect;
  onAct?: (p: Prospect) => void;
}

export default function ProspectRow({ p, onAct }: Props) {
  const r         = rScore(p);
  const band      = rBand(r);
  const avatarCode = stateCode[p.state];

  return (
    <div
      className="prospect-row"
      style={{ display: "grid", position: "relative" }}
    >
      {/* Clickable overlay for row navigation (name/info area) */}
      <Link
        href={`/prospects/${p.id}`}
        style={{
          position: "absolute", inset: 0,
          display: "block", zIndex: 0,
        }}
        aria-label={`Open ${p.name} detail`}
        tabIndex={-1}
      />

      {/* Person — z-index 1 so it's above the link overlay but the link still covers background */}
      <div className="person" style={{ position: "relative", zIndex: 1 }}>
        <div className={`avatar ${avatarCode}`}>{p.initials}</div>
        <div>
          <div className="person-name">{p.name}</div>
          <div className="person-sub">{p.title} · {p.company}</div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <StateBadge state={p.state} />
      </div>

      <div className={`rscore ${band}`} style={{ position: "relative", zIndex: 1 }}>
        {Math.round(r)}
      </div>

      <div className="next-move" style={{ position: "relative", zIndex: 1 }}>
        {p.nextMove?.slice(0, 60)}{p.nextMove && p.nextMove.length > 60 ? "…" : ""}
      </div>

      {/* Act button — highest z-index, stops propagation so it doesn't follow the link */}
      <button
        className="micro-btn"
        style={{ position: "relative", zIndex: 2 }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          if (onAct) {
            onAct(p);
          } else {
            // Fallback: navigate to detail page
            window.location.href = `/prospects/${p.id}`;
          }
        }}
      >
        Act
      </button>
    </div>
  );
}
