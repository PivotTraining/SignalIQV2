"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProspectPicker from "@/components/ProspectPicker";
import { SEQUENCES, branchRecommendation, STATE_LABEL, STATE_COLOR, CHANNEL_ICON } from "@/lib/sequences";
import { stateCode } from "@/lib/nss";
import type { Enrollment } from "@/app/api/sequences/route";
import type { SequenceDef } from "@/lib/sequences";
import type { Prospect } from "@/lib/types";

const SETUP_SQL = `-- Run this once in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id       uuid REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id      text NOT NULL,
  current_step     integer DEFAULT 0,
  enrolled_at      date DEFAULT CURRENT_DATE,
  next_touch_date  date,
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now(),
  UNIQUE(contact_id, sequence_id)
);`;

export default function SequencesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [needsSetup, setNeedsSetup]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [picker, setPicker]           = useState<SequenceDef | null>(null);
  const [actionMsg, setActionMsg]     = useState("");
  const [copied, setCopied]           = useState(false);
  const [expandedSeq, setExpandedSeq] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    try {
      const res = await fetch("/api/sequences");
      const data = await res.json() as { enrollments: Enrollment[]; needsSetup: boolean };
      setEnrollments(data.enrollments ?? []);
      setNeedsSetup(data.needsSetup ?? false);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  async function handleEnroll(seq: SequenceDef, prospect: Prospect) {
    const res = await fetch("/api/sequences/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: prospect.id, sequenceId: seq.id }),
    });
    if (res.ok) {
      setPicker(null);
      flash(`✓ ${prospect.name} enrolled in ${seq.name}`);
      await loadEnrollments();
    } else {
      const err = await res.json() as { error?: string };
      flash(`Error: ${err.error ?? "enrollment failed"}`);
    }
  }

  async function handleAction(enrollmentId: string, action: "advance" | "pause" | "resume" | "complete") {
    const res = await fetch("/api/sequences/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, action }),
    });
    if (res.ok) {
      const label = action === "advance" ? "Step advanced" : action === "pause" ? "Paused" : action === "resume" ? "Resumed" : "Completed";
      flash(`✓ ${label}`);
      await loadEnrollments();
    }
  }

  async function handleRemove(enrollmentId: string, name: string) {
    const res = await fetch(`/api/sequences/${enrollmentId}`, { method: "DELETE" });
    if (res.ok) {
      flash(`Removed ${name} from sequence`);
      await loadEnrollments();
    }
  }

  function flash(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 4000);
  }

  function copySql() {
    navigator.clipboard.writeText(SETUP_SQL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const active    = enrollments.filter(e => e.status === "active");
  const paused    = enrollments.filter(e => e.status === "paused");
  const completed = enrollments.filter(e => e.status === "completed");
  const dueToday  = active.filter(e => e.nextTouchDate && e.nextTouchDate <= new Date().toISOString().slice(0, 10));

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Adaptive Sequences</h1>
          <p className="page-sub">
            State-branching cadences — not linear drips. Each step adapts to the contact's live NSS reading.
          </p>
        </div>
        <div className="topbar-actions">
          {actionMsg && (
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{actionMsg}</span>
          )}
          <div className="pill"><span className="pill-dot" />{active.length} active</div>
        </div>
      </div>

      {/* Setup notice */}
      {needsSetup && (
        <div style={{
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#ca8a04", marginBottom: 4 }}>
              One-time setup needed
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}>
              Run this SQL in your Supabase dashboard (SQL Editor) to enable sequence tracking.
            </div>
            <div style={{
              background: "var(--bg-0)", borderRadius: 8, padding: "10px 14px",
              fontFamily: "SF Mono, Menlo, monospace", fontSize: 11,
              color: "var(--text-1)", lineHeight: 1.6, marginBottom: 10,
              whiteSpace: "pre-wrap",
            }}>
              {SETUP_SQL}
            </div>
            <button
              className="btn"
              onClick={copySql}
              style={{ fontSize: 12 }}
            >
              {copied ? "✓ Copied" : "Copy SQL"}
            </button>
          </div>
        </div>
      )}

      {/* KPI strip */}
      {!needsSetup && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Active",    value: active.length,    color: "var(--accent)" },
            { label: "Due Today", value: dueToday.length,  color: "#ef4444" },
            { label: "Paused",    value: paused.length,    color: "#f97316" },
            { label: "Completed", value: completed.length, color: "#22c55e" },
          ].map(k => (
            <div key={k.label} style={{
              flex: 1, minWidth: 100,
              background: "var(--bg-1)", border: "1px solid var(--line)",
              borderRadius: 12, padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Active enrollments */}
      {!needsSetup && enrollments.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Active Enrollments</div>
              <div className="card-sub">
                {loading ? "Loading…" : `${enrollments.length} contacts in sequences`}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty" style={{ padding: 24, textAlign: "center" }}>Loading…</div>
          ) : enrollments.map(e => {
            const seq   = SEQUENCES.find(s => s.id === e.sequenceId);
            const step  = seq?.steps[e.currentStep];
            const cState = e.contactState as "ventral" | "sympathetic" | "dorsal";
            const branch = seq && step ? branchRecommendation(cState, seq, e.currentStep) : null;
            const isCompleted = e.status === "completed";
            const isPaused    = e.status === "paused";
            const pct = seq ? Math.round((e.currentStep / seq.steps.length) * 100) : 0;
            const overdue = e.nextTouchDate && e.nextTouchDate < new Date().toISOString().slice(0, 10);
            const dueToday = e.nextTouchDate === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={e.id}
                style={{
                  borderBottom: "1px solid var(--line)",
                  padding: "14px 20px",
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  {/* Contact */}
                  <div style={{ minWidth: 180, flex: 1 }}>
                    <Link
                      href={`/prospects/${e.contactId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-0)", marginBottom: 3 }}>
                        {e.contactName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{e.contactCompany}</div>
                    </Link>
                  </div>

                  {/* NSS state */}
                  <span className={`state-badge ${stateCode[cState] ?? "d"}`} style={{ fontSize: 11, flexShrink: 0, marginTop: 2 }}>
                    <span className="state-dot" />
                    {STATE_LABEL[cState] ?? cState}
                  </span>

                  {/* Sequence + step */}
                  <div style={{ minWidth: 200, flex: 2 }}>
                    {seq && (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{seq.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: seq.color }}>{seq.name}</span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                            · Step {isCompleted ? seq.steps.length : e.currentStep + 1} of {seq.steps.length}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, marginBottom: 4, overflow: "hidden" }}>
                          <div style={{ width: `${isCompleted ? 100 : pct}%`, height: "100%", background: seq.color, transition: "width 0.3s" }} />
                        </div>
                        {!isCompleted && step && (
                          <div style={{ fontSize: 11, color: "var(--text-2)" }}>
                            {CHANNEL_ICON[step.channel]} <strong>{step.archetype}</strong> — {step.body.slice(0, 60)}{step.body.length > 60 ? "…" : ""}
                          </div>
                        )}
                        {isCompleted && (
                          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ Sequence complete</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Next touch */}
                  <div style={{ minWidth: 90, textAlign: "right", flexShrink: 0 }}>
                    {!isCompleted && e.nextTouchDate && (
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: overdue ? "#ef4444" : dueToday ? "#f97316" : "var(--text-2)",
                      }}>
                        {overdue ? "⚠ Overdue" : dueToday ? "Due today" : e.nextTouchDate}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>
                      Signal {e.contactSignalScore}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                    {!isCompleted && !isPaused && (
                      <button
                        className="micro-btn"
                        style={{ background: "rgba(124,92,255,0.12)", color: "var(--accent)", border: "none" }}
                        onClick={() => handleAction(e.id, "advance")}
                      >
                        ✓ Done
                      </button>
                    )}
                    {!isCompleted && !isPaused && (
                      <button className="micro-btn" onClick={() => handleAction(e.id, "pause")}>Pause</button>
                    )}
                    {isPaused && (
                      <button
                        className="micro-btn"
                        style={{ color: "#22c55e" }}
                        onClick={() => handleAction(e.id, "resume")}
                      >
                        Resume
                      </button>
                    )}
                    {!isCompleted && (
                      <button
                        className="micro-btn"
                        style={{ color: "#22c55e" }}
                        onClick={() => handleAction(e.id, "complete")}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      className="micro-btn"
                      style={{ color: "var(--danger, #ef4444)" }}
                      onClick={() => handleRemove(e.id, e.contactName)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Adaptive branching recommendation */}
                {branch && !isCompleted && (
                  <div style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: `${STATE_COLOR[cState] ?? "#888"}15`,
                    border: `1px solid ${STATE_COLOR[cState] ?? "#888"}33`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--text-1)",
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>🧠</span>
                    <span>
                      <strong style={{ color: STATE_COLOR[cState] }}>Adaptive signal:</strong>{" "}
                      {branch}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && enrollments.length === 0 && (
            <div className="empty" style={{ padding: 24, textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
              No active enrollments. Activate a sequence below to get started.
            </div>
          )}
        </div>
      )}

      {/* Sequence templates */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SEQUENCES.map(seq => {
          const isExpanded = expandedSeq === seq.id;
          const activeCount = enrollments.filter(e => e.sequenceId === seq.id && e.status === "active").length;

          return (
            <div className="card" key={seq.id}>
              <div
                className="card-header"
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedSeq(isExpanded ? null : seq.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <span style={{
                    fontSize: 20, width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: seq.color + "18",
                    border: `1px solid ${seq.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{seq.icon}</span>
                  <div>
                    <div className="card-title" style={{ color: seq.color }}>{seq.name}</div>
                    <div className="card-sub">{seq.description}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  {activeCount > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                      background: seq.color + "22", color: seq.color,
                    }}>
                      {activeCount} active
                    </span>
                  )}
                  <span style={{
                    fontSize: 11, color: "var(--text-3)",
                    background: "var(--bg-3)", borderRadius: 6,
                    padding: "3px 8px",
                  }}>
                    Entry: <span style={{
                      color: STATE_COLOR[seq.targetEntry],
                      fontWeight: 600,
                    }}>
                      {STATE_LABEL[seq.targetEntry]}
                    </span>
                  </span>
                  {!needsSetup && (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: "5px 12px" }}
                      onClick={e => { e.stopPropagation(); setPicker(seq); }}
                    >
                      + Activate
                    </button>
                  )}
                  <span style={{
                    fontSize: 16, color: "var(--text-3)",
                    transition: "transform 0.2s",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}>
                    ›
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 20px 16px" }}>
                  {seq.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", gap: 14, alignItems: "flex-start",
                        padding: "12px 0",
                        borderTop: i > 0 ? "1px solid var(--line)" : "none",
                      }}
                    >
                      {/* Step number + connector */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: seq.color + "20",
                          border: `2px solid ${seq.color}50`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: seq.color,
                        }}>
                          {i + 1}
                        </div>
                        {i < seq.steps.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 16, background: seq.color + "30", marginTop: 4 }} />
                        )}
                      </div>

                      {/* Step content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            background: seq.color + "18",
                            color: seq.color,
                            padding: "2px 8px", borderRadius: 4,
                          }}>
                            {step.archetype}
                          </span>
                          <span style={{
                            fontSize: 11, color: "var(--text-3)",
                            background: "var(--bg-3)",
                            padding: "2px 8px", borderRadius: 4,
                          }}>
                            {CHANNEL_ICON[step.channel]} {step.channel}
                          </span>
                          <span style={{
                            fontSize: 11,
                            background: STATE_COLOR[step.targetState] + "18",
                            color: STATE_COLOR[step.targetState],
                            padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                          }}>
                            {STATE_LABEL[step.targetState]}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>
                            Day {step.day}
                          </span>
                        </div>

                        <div style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5, marginBottom: step.tip ? 6 : 0 }}>
                          {step.body}
                        </div>

                        {step.tip && (
                          <div style={{
                            fontSize: 11, color: "var(--text-2)",
                            background: "var(--bg-2)", borderRadius: 6,
                            padding: "6px 10px", marginTop: 6,
                            borderLeft: `3px solid ${seq.color}60`,
                          }}>
                            💡 {step.tip}
                          </div>
                        )}

                        {step.adaptations && Object.keys(step.adaptations).length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {Object.entries(step.adaptations).map(([state, text]) => (
                              <div key={state} style={{
                                fontSize: 11, color: "var(--text-2)",
                                display: "flex", alignItems: "flex-start", gap: 6,
                                marginBottom: 4,
                              }}>
                                <span style={{
                                  background: STATE_COLOR[state as "ventral" | "sympathetic" | "dorsal"] + "18",
                                  color: STATE_COLOR[state as "ventral" | "sympathetic" | "dorsal"],
                                  padding: "1px 6px", borderRadius: 4, fontWeight: 600,
                                  flexShrink: 0, marginTop: 1,
                                }}>
                                  If {STATE_LABEL[state as "ventral" | "sympathetic" | "dorsal"]}
                                </span>
                                <span>{text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ProspectPicker modal */}
      {picker && (
        <ProspectPicker
          sequence={picker}
          onEnroll={(prospect) => handleEnroll(picker, prospect)}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}
