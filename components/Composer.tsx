"use client";
import { useEffect, useState } from "react";
import type { Prospect } from "@/lib/types";
import { archetypeColor } from "@/lib/generate";
import { stateCode } from "@/lib/nss";

type Candidate = { archetype: string; body: string };

export default function Composer({ prospect }: { prospect: Prospect }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<null | "approved" | "adapted">(null);

  async function load() {
    setLoading(true);
    setSent(null);
    const res = await fetch(`/api/messages?id=${prospect.id}`, { cache: "no-store" });
    const data = await res.json();
    setCandidates(data.candidates);
    setActive(0);
    setDraft(data.candidates[0]?.body ?? "");
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [prospect.id]);

  const code = archetypeColor(prospect.state);
  const badgeClass = `state-badge ${code}`;

  return (
    <div className="composer">
      <div className="composer-header">
        <div className="composer-title">AI-drafted next touch</div>
        <span className={badgeClass}>
          <span className="state-dot" />
          {candidates[active]?.archetype ?? "Loading"}
        </span>
      </div>

      {loading ? (
        <div className="empty">Generating candidates...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {candidates.map((c, i) => (
              <button key={i}
                className="micro-btn"
                onClick={() => { setActive(i); setDraft(c.body); setSent(null); }}
                style={i === active ? {
                  background: `var(--${prospect.state === "sympathetic" ? "sympathetic" : prospect.state === "dorsal" ? "dorsal" : "ventral"})`,
                  color: "#07090d", borderColor: "transparent"
                } : undefined}>
                {i + 1}. {c.archetype}
              </button>
            ))}
          </div>

          <textarea
            className="msg-edit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ height: 12 }} />

          <div className="composer-actions">
            <button className="btn btn-primary"
              onClick={() => setSent("approved")}>
              Approve & send
            </button>
            <button className="btn" onClick={() => setSent("adapted")}>
              Save as draft
            </button>
            <button className="btn" onClick={load}>Regenerate</button>
            <span className="composer-ghost">
              {sent === "approved" && "Queued for send. Feedback logged."}
              {sent === "adapted" && "Draft saved. Voice calibration updated."}
              {!sent && `${draft.trim().split(/\s+/).length} words · matches ${stateCode[prospect.state].toUpperCase()}-state cadence`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
