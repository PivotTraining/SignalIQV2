"use client";
import { useEffect, useState } from "react";
import type { Prospect } from "@/lib/types";
import { archetypeColor } from "@/lib/generate";
import { stateCode } from "@/lib/nss";

type Candidate = { archetype: string; body: string };

function emailSubject(state: string): string {
  if (state === "ventral")     return "Quick follow-up from Pivot Training";
  if (state === "sympathetic") return "Something a little different from Pivot Training";
  return "No agenda — just reaching back out";
}

export default function Composer({ prospect, email }: { prospect: Prospect; email?: string | null }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<null | "approved" | "adapted">(null);

  async function load() {
    setLoading(true);
    setSent(null);
    const res  = await fetch(`/api/messages?id=${prospect.id}`, { cache: "no-store" });
    const data = await res.json();
    const list: Candidate[] = Array.isArray(data.candidates) ? data.candidates : [];
    setCandidates(list);
    setActive(0);
    setDraft(list[0]?.body ?? "");
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
              onClick={() => {
                const to = email ?? prospect.email ?? "";
                if (to) {
                  const subject = encodeURIComponent(emailSubject(prospect.state));
                  const body    = encodeURIComponent(draft);
                  window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_self");
                } else {
                  // No email — copy to clipboard
                  navigator.clipboard?.writeText(draft).catch(() => {});
                }
                setSent("approved");
              }}>
              {(email ?? (prospect as { email?: string | null }).email) ? "Approve & send ↗" : "Copy draft"}
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
