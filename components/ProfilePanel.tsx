"use client";
import { useEffect, useRef, useState } from "react";
import type { Prospect, ProspectPriority } from "@/lib/types";
import LogInteraction from "./LogInteraction";

/* ── helpers ── */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parsePhone(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(";")[0].trim();
  return first.replace(/\s*ext\.?\s*\d+/gi, "").trim() || null;
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: "rgba(239,68,68,0.10)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  mid:  { bg: "rgba(234,179,8,0.10)",   color: "#ca8a04", border: "rgba(234,179,8,0.25)" },
  low:  { bg: "rgba(100,116,139,0.10)", color: "#64748b", border: "rgba(100,116,139,0.25)" },
};

type Tab = "overview" | "notes" | "history";

interface Props {
  prospect: Prospect;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: (p: Prospect) => void;
}

export default function ProfilePanel({ prospect: initial, onClose, onDeleted, onUpdated }: Props) {
  const [p, setP]             = useState<Prospect>(initial);
  const [tab, setTab]         = useState<Tab>("overview");
  const [notesDraft, setNotesDraft] = useState(p.nextMove ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep in sync if parent updates the prospect
  useEffect(() => {
    setP(initial);
    setNotesDraft(initial.nextMove ?? "");
  }, [initial.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const initials = p.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const phone    = parsePhone(p.phone);

  /* ── patch helper ── */
  async function patch(updates: Record<string, unknown>) {
    const next = { ...p, ...updates } as Prospect;
    setP(next);
    onUpdated?.(next);
    try {
      await fetch(`/api/contacts/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch { /* optimistic — ignore */ }
  }

  /* ── notes auto-save ── */
  function handleNotesChange(val: string) {
    setNotesDraft(val);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      patch({ nextMove: val.trim() || null });
      setNotesSaved(true);
    }, 800);
  }

  /* ── priority ── */
  function handlePriority(val: string) {
    patch({ priority: val === "" ? null : val as ProspectPriority });
  }

  /* ── last contacted ── */
  function handleLastContacted(val: string) {
    patch({ lastContacted: val || null });
    setEditingDate(false);
  }

  /* ── delete ── */
  async function handleDelete() {
    if (!confirm(`Remove ${p.name} from your pipeline?`)) return;
    await fetch(`/api/contacts/${p.id}`, { method: "DELETE" });
    onDeleted?.();
    onClose();
  }

  const priKey   = p.priority ?? "none";
  const priStyle = PRIORITY_STYLE[priKey as keyof typeof PRIORITY_STYLE] ?? { bg: "rgba(148,163,184,0.06)", color: "#94a3b8", border: "rgba(148,163,184,0.15)" };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 200,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(520px, 100vw)",
          background: "var(--bg-1)",
          borderLeft: "1px solid var(--line)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
      >

        {/* ── Header ── */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#f59e0b", fontWeight: 700, fontSize: 16,
            flexShrink: 0,
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-0)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {[p.title, p.company].filter(Boolean).join(" · ")}
            </div>

            {/* Priority + quick actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <select
                  value={p.priority ?? ""}
                  onChange={e => handlePriority(e.target.value)}
                  style={{
                    padding: "3px 22px 3px 10px",
                    borderRadius: 20,
                    fontSize: 11.5, fontWeight: 600,
                    background: priStyle.bg,
                    color: priStyle.color,
                    border: `1px solid ${priStyle.border}`,
                    outline: "none", cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="">— Priority</option>
                  <option value="high">High</option>
                  <option value="mid">Mid</option>
                  <option value="low">Low</option>
                </select>
                <span style={{ position: "absolute", right: 7, pointerEvents: "none", fontSize: 8, color: priStyle.color }}>▼</span>
              </div>

              {p.email && (
                <a href={`mailto:${p.email}`} className="micro-btn" style={{ textDecoration: "none", fontSize: 11 }}>
                  ✉ Email
                </a>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/\s/g,"")}`} className="micro-btn" style={{ textDecoration: "none", fontSize: 11 }}>
                  📞 Call
                </a>
              )}
              <a
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name + " " + p.company)}`}
                target="_blank" rel="noopener noreferrer"
                className="micro-btn" style={{ textDecoration: "none", fontSize: 11 }}
              >
                💼 LinkedIn
              </a>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 20, lineHeight: 1,
              padding: "2px 4px", flexShrink: 0,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--line)",
          padding: "0 24px",
        }}>
          {(["overview", "notes", "history"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "none", border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                color: tab === t ? "var(--text-0)" : "var(--text-3)",
                fontWeight: tab === t ? 600 : 400,
                fontSize: 13, cursor: "pointer",
                padding: "10px 0",
                marginRight: 24,
                transition: "color 0.15s",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "history" && p.interactions.length > 0 && (
                <span style={{
                  marginLeft: 6,
                  fontSize: 10, fontWeight: 600,
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 5px",
                }}>
                  {p.interactions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Overview */}
          {tab === "overview" && (
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Contact Info */}
              <section>
                <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>
                  Contact Info
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {p.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-3)", width: 16, fontSize: 12 }}>✉</span>
                      <a href={`mailto:${p.email}`} style={{ fontSize: 13, color: "var(--text-1)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-1)")}
                      >{p.email}</a>
                    </div>
                  )}
                  {phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-3)", width: 16, fontSize: 12 }}>📞</span>
                      <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ fontSize: 13, color: "var(--text-1)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-1)")}
                      >{phone}</a>
                    </div>
                  )}
                  {p.industry && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-3)", width: 16, fontSize: 12 }}>🏢</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{p.industry}</span>
                    </div>
                  )}
                  {p.headcount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-3)", width: 16, fontSize: 12 }}>👥</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{p.headcount.toLocaleString()} employees</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Last Contacted */}
              <section>
                <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>
                  Last Contacted
                </div>
                {editingDate ? (
                  <input
                    type="date"
                    defaultValue={p.lastContacted ?? ""}
                    autoFocus
                    onChange={e => handleLastContacted(e.target.value)}
                    onBlur={() => setEditingDate(false)}
                    style={{
                      fontSize: 13, padding: "5px 8px", borderRadius: 6,
                      border: "1px solid var(--line-2)", background: "var(--bg-2)",
                      color: "var(--text-0)", outline: "none",
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingDate(true)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      fontSize: 13, color: p.lastContacted ? "var(--text-1)" : "var(--text-3)",
                    }}
                  >
                    {p.lastContacted ? formatDate(p.lastContacted) : "+ Set date"}
                  </button>
                )}
              </section>

              {/* Tech stack */}
              {p.stack?.length > 0 && (
                <section>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>
                    Tech Stack
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.stack.map((s, i) => (
                      <span key={i} style={{
                        fontSize: 11.5, padding: "3px 10px", borderRadius: 20,
                        background: "var(--bg-3)", color: "var(--text-2)",
                        border: "1px solid var(--line-2)",
                      }}>{s}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Signals */}
              {p.signals?.length > 0 && (
                <section>
                  <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>
                    Buying Signals
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.signals.map((s, i) => (
                      <div key={i} style={{
                        background: "var(--bg-2)", borderRadius: 8,
                        padding: "8px 12px",
                        border: "1px solid var(--line-2)",
                      }}>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 13, color: "var(--text-1)" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Notes */}
          {tab === "notes" && (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)" }}>
                  Notes
                </div>
                {notesSaved && (
                  <span style={{ fontSize: 11, color: "var(--ventral, #22c55e)" }}>Saved</span>
                )}
              </div>
              <textarea
                value={notesDraft}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Write anything — what you discussed, next steps, objections, context…"
                style={{
                  width: "100%", minHeight: 360,
                  padding: "12px 14px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  borderRadius: 10,
                  color: "var(--text-0)",
                  fontSize: 13.5, lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e  => (e.target.style.borderColor = "var(--line-2)")}
              />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Auto-saves as you type</div>
            </div>
          )}

          {/* History */}
          {tab === "history" && (
            <div>
              {/* Log new interaction */}
              <LogInteraction contactId={p.id} onLogged={() => {
                // Re-fetch this prospect to get updated interactions
                fetch(`/api/contacts/${p.id}`)
                  .then(r => r.json())
                  .then(updated => { setP(updated); onUpdated?.(updated); })
                  .catch(() => {});
              }} />

              {/* Interaction history */}
              <div style={{ padding: "0 0 20px" }}>
                {p.interactions.length === 0 ? (
                  <div style={{ padding: "20px 24px", color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>
                    No interactions logged yet.
                  </div>
                ) : (
                  [...p.interactions].reverse().map(i => (
                    <div key={i.id} style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 24px",
                      borderBottom: "1px solid var(--line)",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: i.direction === "in" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                        color: i.direction === "in" ? "#22c55e" : "#f59e0b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>
                        {i.direction === "in" ? "◀" : "▶"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "var(--text-0)", lineHeight: 1.5 }}>{i.body}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                          {i.direction === "in" ? "Reply" : "Sent"} · {i.channel} · {i.at}
                          {i.latencyHours != null ? ` · ${i.latencyHours}h latency` : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: "1px solid var(--line)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <button
            onClick={handleDelete}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "rgba(239,68,68,0.5)",
              padding: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
          >
            Remove contact
          </button>
          <button className="micro-btn" onClick={onClose}>Done</button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
