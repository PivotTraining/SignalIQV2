"use client";
import { useEffect, useState, useRef } from "react";
import type { Prospect } from "@/lib/types";
import { stateCode, stateLabel, nextMoveFor, forbiddenFor } from "@/lib/nss";
import { rBand, rScore, rBandLabel } from "@/lib/rscore";
import { getCallScript, getEmailScript, NSS_TONE } from "@/lib/callScripts";
import Composer from "./Composer";
import LogInteraction from "./LogInteraction";
import StateBadge from "./StateBadge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePhone(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(";")[0].trim();
  const clean = first.replace(/\s*ext\.?\s*\d+/gi, "").trim();
  // Keep only digits, +, -, (, ), spaces
  return clean.replace(/[^\d+\-()\s]/g, "").trim() || null;
}

function scoreBand(s: number) {
  if (s >= 80) return { label: "🔥 Hot",     color: "#f97316" };
  if (s >= 60) return { label: "⚡ Warm",     color: "#eab308" };
  if (s >= 40) return { label: "🌡 Cooling",  color: "#6366f1" };
  if (s >= 20) return { label: "❄️ Cold",     color: "#64748b" };
  return            { label: "💤 Dormant",   color: "#94a3b8" };
}

function emailSubject(state: string): string {
  if (state === "ventral")     return "Quick follow-up from Pivot Training";
  if (state === "sympathetic") return "Something a little different from Pivot Training";
  return "No agenda — just wanted to reach back out";
}

function emailOpener(name: string, state: string): string {
  const first = name.split(" ")[0];
  if (state === "ventral")
    return `Hi ${first},\n\nFollowing up on our last conversation — wanted to share a few outcomes from districts similar to yours and see if it makes sense to connect for 20 minutes.\n\n`;
  if (state === "sympathetic")
    return `Hi ${first},\n\nI won't take much of your time. I just wanted to send one thing that's different from the usual outreach you probably get — a quick look at what schools like yours are doing differently around staff wellness.\n\n`;
  return `Hi ${first},\n\nNo agenda here — just checking back in and wanted you to know Pivot Training is still in your corner whenever the timing is right.\n\nNo pressure at all. But if you've got 20 minutes in the coming weeks, I'd love to reconnect.\n\n`;
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: "var(--text-2)" }}>{label} <span style={{ color: "var(--text-3)" }}>({weight})</span></span>
        <span style={{ fontFamily: "SF Mono, Menlo, monospace", color: "var(--text-0)", fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 5, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${value}%`, height: "100%",
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
        }} />
      </div>
    </div>
  );
}

// ── Call Script panel ─────────────────────────────────────────────────────────

function CallScriptPanel({ prospect }: { prospect: Prospect }) {
  const script  = getCallScript(prospect.industry);
  const nssTone = NSS_TONE[prospect.state];
  const first   = prospect.name.split(" ")[0];
  const [step, setStep]   = useState(0);
  const [vmType, setVmType] = useState<"cold" | "followup" | "reengagement">("cold");
  const [copied, setCopied] = useState(false);

  function fill(text: string) {
    return text
      .replace(/\[Name\]/g, first)
      .replace(/\[Company\]/g, prospect.company)
      .replace(/\[Your Name\]/g, "Chris")
      .replace(/\[Your Number\]/g, "[your number]");
  }

  const CALL_STEPS = [
    { label: "Gatekeeper", emoji: "🚪", text: fill(script.gatekeeper) },
    { label: "Opener",     emoji: "👋", text: fill(script.opener) },
    { label: "Rapport",    emoji: "🤝", text: fill(script.rapport) },
    { label: "Discovery",  emoji: "🔍", text: fill(script.discovery) },
    { label: "Pivot",      emoji: "🔄", text: fill(script.pivot) },
    { label: "Bridge",     emoji: "🌉", text: fill(script.bridge) },
    { label: "Rebuttal",   emoji: "🛡", text: fill(script.rebuttal) },
    { label: "Close",      emoji: "🤙", text: fill(script.close) },
  ];

  const VM_LABELS: Record<typeof vmType, string> = {
    cold:         "First touch",
    followup:     "Follow-up",
    reengagement: "Re-engage",
  };
  const VM_DESC: Record<typeof vmType, string> = {
    cold:         "Never spoken — keep it short and intriguing",
    followup:     "After an email or prior attempt",
    reengagement: "Reconnecting after a period of silence",
  };

  const vmText = fill(script.voicemail[vmType]);

  function copyVm() {
    navigator.clipboard.writeText(vmText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const stateColor = prospect.state === "ventral" ? "#22c55e" : prospect.state === "sympathetic" ? "#f97316" : "#8b5cf6";

  return (
    <div style={{ padding: "16px 0" }}>
      {/* NSS advisory */}
      <div style={{
        padding: "10px 14px", borderRadius: 8, marginBottom: 14,
        background: stateColor + "12", border: `1px solid ${stateColor}30`,
      }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: stateColor, marginBottom: 3, fontWeight: 600 }}>
          {stateLabel[prospect.state]} — {prospect.industry || "General"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.6 }}>{nssTone}</div>
      </div>

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {CALL_STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 11.5, cursor: "pointer",
            border: `1px solid ${step === i ? "var(--accent)" : "var(--line-2)"}`,
            background: step === i ? "var(--accent)" : "var(--bg-3)",
            color: step === i ? "#fff" : "var(--text-2)",
            fontWeight: step === i ? 600 : 400,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Script text */}
      <div style={{
        padding: "18px 20px", borderRadius: 10, marginBottom: 12,
        background: "var(--bg-2)", border: "1px solid var(--line)",
        fontSize: 14.5, lineHeight: 1.9, color: "var(--text-0)",
        fontStyle: "italic", minHeight: 90,
        whiteSpace: "pre-wrap",
      }}>
        "{CALL_STEPS[step].text}"
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <button className="btn btn-primary" onClick={() => setStep(Math.min(CALL_STEPS.length - 1, step + 1))} disabled={step === CALL_STEPS.length - 1}>Next →</button>
        <span style={{ fontSize: 11, color: "var(--text-3)", alignSelf: "center", marginLeft: 4 }}>
          {step + 1} / {CALL_STEPS.length}
        </span>
      </div>

      {/* Voicemail section */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 600, marginBottom: 10 }}>
          📱 Voicemail scripts
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {(["cold", "followup", "reengagement"] as const).map(t => (
            <button key={t} onClick={() => setVmType(t)} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11.5, cursor: "pointer",
              border: `1px solid ${vmType === t ? "#8b5cf6" : "var(--line-2)"}`,
              background: vmType === t ? "rgba(139,92,246,0.12)" : "var(--bg-3)",
              color: vmType === t ? "#8b5cf6" : "var(--text-2)",
              fontWeight: vmType === t ? 600 : 400,
            }}>
              {VM_LABELS[t]}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{VM_DESC[vmType]} · 20–30 seconds spoken</div>
        <div style={{
          padding: "14px 16px", borderRadius: 10, marginBottom: 10,
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
          fontSize: 13.5, lineHeight: 1.85, color: "var(--text-0)",
          fontStyle: "italic", whiteSpace: "pre-wrap",
        }}>
          "{vmText}"
        </div>
        <button className="btn" style={{ fontSize: 12 }} onClick={copyVm}>
          {copied ? "✓ Copied" : "Copy voicemail"}
        </button>
      </div>

      {/* Tips */}
      <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-2)", marginBottom: 8, fontWeight: 600 }}>
          Call tips — {prospect.industry || "General"}
        </div>
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {script.tips.map((t, i) => (
            <li key={i} style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 2 }}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Email Script panel ────────────────────────────────────────────────────────

function EmailScriptPanel({ prospect }: { prospect: Prospect }) {
  const script    = getEmailScript(prospect.industry);
  const emailBody = script.states[prospect.state];
  const first     = prospect.name.split(" ")[0];
  const [subIdx, setSubIdx]   = useState(0);
  const [copied, setCopied]   = useState<"subject" | "body" | "all" | null>(null);

  function fill(text: string) {
    return text
      .replace(/\[FirstName\]/g, first)
      .replace(/\[Name\]/g, prospect.name)
      .replace(/\[Company\]/g, prospect.company)
      .replace(/\[Organization\]/g, prospect.company)
      .replace(/\[Department\]/g, prospect.company)
      .replace(/\[Similar District\]/g, "similar districts")
      .replace(/\[Similar Org Type\]/g, "similar organizations")
      .replace(/\[Region\]/g, "regional")
      .replace(/\[timing \/ interest\]/g, "our last conversation")
      .replace(/\[Day\]/g, "this week");
  }

  const subject  = fill(script.subjects[subIdx] ?? "");
  const body     = fill(emailBody.body);
  const ps       = emailBody.ps ? fill(emailBody.ps) : null;
  const fullText = `Subject: ${subject}\n\n${body}${ps ? `\n\nP.S. ${ps}` : ""}`;

  function copy(what: "subject" | "body" | "all") {
    const text = what === "subject" ? subject : what === "body" ? body + (ps ? `\n\nP.S. ${ps}` : "") : fullText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function sendEmail() {
    if (!prospect.email) return;
    const sub  = encodeURIComponent(subject);
    const bod  = encodeURIComponent(body + (ps ? `\n\nP.S. ${ps}` : ""));
    window.open(`mailto:${prospect.email}?subject=${sub}&body=${bod}`, "_self");
  }

  const STATE_LABEL_LOCAL: Record<string, string> = { ventral: "Engaged", sympathetic: "Cautious", dorsal: "Quiet" };
  const STATE_COLOR_LOCAL: Record<string, string>  = { ventral: "#22c55e", sympathetic: "#f97316", dorsal: "#8b5cf6" };
  const stateColor = STATE_COLOR_LOCAL[prospect.state] ?? "var(--accent)";

  return (
    <div style={{ padding: "16px 0" }}>
      {/* State advisory */}
      <div style={{
        padding: "10px 14px", borderRadius: 8, marginBottom: 14,
        background: stateColor + "12", border: `1px solid ${stateColor}30`,
      }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: stateColor, marginBottom: 3, fontWeight: 600 }}>
          {STATE_LABEL_LOCAL[prospect.state]} — {prospect.industry || "General"} script
        </div>
        <div style={{ fontSize: 12, color: "var(--text-2)" }}>
          {NSS_TONE[prospect.state]}
        </div>
      </div>

      {/* Subject line picker */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>
          Subject line — pick one
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {script.subjects.map((s, i) => (
            <div
              key={i}
              onClick={() => setSubIdx(i)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                background: subIdx === i ? stateColor + "14" : "var(--bg-2)",
                border: `1px solid ${subIdx === i ? stateColor + "50" : "var(--line-2)"}`,
                transition: "all 0.12s",
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${subIdx === i ? stateColor : "var(--line-2)"}`,
                background: subIdx === i ? stateColor : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {subIdx === i && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "block" }} />}
              </span>
              <span style={{ fontSize: 12.5, color: subIdx === i ? "var(--text-0)" : "var(--text-2)", fontWeight: subIdx === i ? 600 : 400 }}>
                {fill(s)}
              </span>
              {subIdx === i && (
                <button
                  onClick={e => { e.stopPropagation(); copy("subject"); }}
                  style={{ marginLeft: "auto", fontSize: 11, background: "none", border: "none", cursor: "pointer", color: copied === "subject" ? stateColor : "var(--text-3)" }}
                >
                  {copied === "subject" ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email body */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 600 }}>
            Email body
          </div>
          <button
            onClick={() => copy("body")}
            style={{ marginLeft: "auto", fontSize: 11, background: "none", border: "none", cursor: "pointer", color: copied === "body" ? stateColor : "var(--text-3)" }}
          >
            {copied === "body" ? "✓ Copied" : "Copy body"}
          </button>
        </div>
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: "var(--bg-2)", border: "1px solid var(--line)",
          fontSize: 13, lineHeight: 1.8, color: "var(--text-0)",
          whiteSpace: "pre-wrap",
        }}>
          {body}
          {ps && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-2)", fontStyle: "italic" }}>
              P.S. {ps}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {prospect.email ? (
          <button className="btn btn-primary" onClick={sendEmail}>
            Open in Mail ↗
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => copy("all")}>
            {copied === "all" ? "✓ Copied!" : "Copy full email"}
          </button>
        )}
        {!prospect.email && (
          <span style={{ fontSize: 11.5, color: "var(--text-3)", alignSelf: "center" }}>
            No email on file — paste into your mail client
          </span>
        )}
      </div>

      {/* Tips */}
      <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: stateColor, marginBottom: 8, fontWeight: 600 }}>
          Email Tips — {prospect.industry || "General"}
        </div>
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {script.tips.map((t, i) => (
            <li key={i} style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 2 }}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Signal Script panel (PressureIQ / BurnoutIQ) ─────────────────────────────

function SignalScriptPanel({ prospect }: { prospect: Prospect }) {
  const hasPressure = prospect.timingWindow >= 60 || prospect.intentVelocity >= 70;
  const hasBurnout  = prospect.state === "dorsal" && prospect.lastTouchDaysAgo >= 21;
  const first       = prospect.name.split(" ")[0];

  type Mode = "pressure" | "burnout";
  const [mode, setMode]   = useState<Mode>(hasPressure ? "pressure" : "burnout");
  const [step, setStep]   = useState(0);
  const [copied, setCopied] = useState(false);

  function fill(text: string) {
    return text
      .replace(/\[Name\]/g, first)
      .replace(/\[Company\]/g, prospect.company)
      .replace(/\[Industry\]/g, prospect.industry || "your sector")
      .replace(/\[Days\]/g, String(prospect.lastTouchDaysAgo));
  }

  const PRESSURE_STEPS = [
    {
      label: "Pattern interrupt",
      emoji: "⚡",
      tip: "Skip the pleasantries — they're in a decision window. Name the moment.",
      text: `Hey [Name], I'm going to skip the usual part of the call. I've been paying attention to what's happening at [Company] and I think there's a specific reason — right now, not in six months — that a conversation makes sense. You have two minutes?`,
    },
    {
      label: "Name the pressure",
      emoji: "🎯",
      tip: "Lead with what the signals say. You're not guessing — you're reflecting.",
      text: `Here's what I'm picking up on. You're at a point in the year where staffing decisions start happening — good people are weighing their options, administrators are looking at what's working, and something's usually sitting on somebody's desk that hasn't been addressed yet. Is any of that landing right now?`,
    },
    {
      label: "Pressure discovery",
      emoji: "🔍",
      tip: "Ask about the thing with a deadline. Urgency-aware discovery.",
      text: `What's the most pressing thing on your plate right now — specifically the thing that has a clock on it? The one that if you don't move on it this semester it gets harder? I want to understand that before I say anything about what we do.`,
    },
    {
      label: "Bridge to now",
      emoji: "🌉",
      tip: "Connect their urgency to your speed. You move fast — most programs don't.",
      text: `That's exactly the kind of situation where timing matters for what we do. Most things in this space take months to spin up. What we do is designed to move. I can show you an organization that was in your exact position and what they did in 90 days. Can we find 20 minutes this week?`,
    },
    {
      label: "Tight close",
      emoji: "🤙",
      tip: "Specific ask. They're in a window — don't leave it open-ended.",
      text: `I'm not going to sell you anything today. I want to put one case study in front of you — matches what you just described — and let you decide if there's a conversation worth having. Is this week better or early next?`,
    },
  ];

  const BURNOUT_STEPS = [
    {
      label: "Human first",
      emoji: "🤝",
      tip: "Do NOT pitch. Something shifted. Lead with care — if you pitch now you're done.",
      text: `Hey [Name], this is Chris Davis — I'm not calling to pitch you anything. I noticed it's been a while since we connected and I just wanted to check in. Not on the business side. How are things actually going over there?`,
    },
    {
      label: "Name the silence",
      emoji: "🌑",
      tip: "Name what you're observing without making them feel bad about it.",
      text: `I ask because what I'm seeing at a lot of [Industry] right now is that the people running things are carrying more than they're letting on. And when I stop hearing from someone I've been in conversation with, it's usually not because things got easier.`,
    },
    {
      label: "Real question",
      emoji: "🔍",
      tip: "One honest question. Give them room to say something real.",
      text: `How is your staff actually doing right now? Not the official answer — what's it like in the building? Because if things have gotten harder since we last talked, I want to know that before I say anything else.`,
    },
    {
      label: "Soft bridge",
      emoji: "🌉",
      tip: "Only go here if they opened up. Don't force it. Match their energy.",
      text: `What you just described — I hear that constantly right now. And what I've seen is that the organizations that wait for it to get better on its own usually don't find that it does. I'm not asking you to commit to anything. I just want to know if it's worth staying in your world for when the timing shifts.`,
    },
    {
      label: "No-pressure close",
      emoji: "🌱",
      tip: "A yes to staying connected is the win here. That's all.",
      text: `I don't need a decision on anything. I just want to know: is it worth me checking back in a few weeks? If the answer is yes, I'll be here. If the answer is no, just say so and I'll leave you alone.`,
    },
  ];

  const steps = mode === "pressure" ? PRESSURE_STEPS : BURNOUT_STEPS;

  function copyStep() {
    navigator.clipboard.writeText(fill(steps[step].text)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Which signals are active */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {hasPressure && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, flex: 1, minWidth: 160,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          }}>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ef4444", fontWeight: 700, marginBottom: 2 }}>
              🔴 PressureIQ active
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>
              {prospect.timingWindow >= 60 ? `Timing window: ${prospect.timingWindow}` : ""}
              {prospect.timingWindow >= 60 && prospect.intentVelocity >= 70 ? " · " : ""}
              {prospect.intentVelocity >= 70 ? `Intent: ${prospect.intentVelocity}` : ""}
            </div>
          </div>
        )}
        {hasBurnout && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, flex: 1, minWidth: 160,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          }}>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f59e0b", fontWeight: 700, marginBottom: 2 }}>
              🟡 BurnoutIQ active
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>
              Gone quiet · {prospect.lastTouchDaysAgo}d since last touch
            </div>
          </div>
        )}
        {!hasPressure && !hasBurnout && (
          <div style={{
            padding: "8px 12px", borderRadius: 8,
            background: "var(--bg-2)", border: "1px solid var(--line-2)",
            fontSize: 12, color: "var(--text-3)",
          }}>
            No active signal detected — scripts shown for general context
          </div>
        )}
      </div>

      {/* Mode toggle if both signals active */}
      {hasPressure && hasBurnout && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button
            onClick={() => { setMode("pressure"); setStep(0); }}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: `1px solid ${mode === "pressure" ? "#ef4444" : "var(--line-2)"}`,
              background: mode === "pressure" ? "rgba(239,68,68,0.1)" : "var(--bg-3)",
              color: mode === "pressure" ? "#ef4444" : "var(--text-2)",
              fontWeight: mode === "pressure" ? 700 : 400,
            }}
          >
            🔴 PressureIQ
          </button>
          <button
            onClick={() => { setMode("burnout"); setStep(0); }}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: `1px solid ${mode === "burnout" ? "#f59e0b" : "var(--line-2)"}`,
              background: mode === "burnout" ? "rgba(245,158,11,0.1)" : "var(--bg-3)",
              color: mode === "burnout" ? "#f59e0b" : "var(--text-2)",
              fontWeight: mode === "burnout" ? 700 : 400,
            }}
          >
            🟡 BurnoutIQ
          </button>
        </div>
      )}

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const activeColor = mode === "pressure" ? "#ef4444" : "#f59e0b";
          return (
            <button key={i} onClick={() => setStep(i)} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11.5, cursor: "pointer",
              border: `1px solid ${step === i ? activeColor : "var(--line-2)"}`,
              background: step === i ? activeColor + "18" : "var(--bg-3)",
              color: step === i ? activeColor : "var(--text-2)",
              fontWeight: step === i ? 700 : 400,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span>{s.emoji}</span> {s.label}
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div style={{
        padding: "7px 12px", borderRadius: 7, marginBottom: 10,
        background: "var(--bg-2)", border: "1px solid var(--line)",
        fontSize: 11.5, color: "var(--text-3)", fontStyle: "italic",
      }}>
        💡 {steps[step].tip}
      </div>

      {/* Script text */}
      <div style={{
        padding: "18px 20px", borderRadius: 10, marginBottom: 12,
        background: "var(--bg-2)", border: "1px solid var(--line)",
        fontSize: 14.5, lineHeight: 1.9, color: "var(--text-0)",
        fontStyle: "italic", minHeight: 90, whiteSpace: "pre-wrap",
      }}>
        "{fill(steps[step].text)}"
      </div>

      {/* Nav + copy */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>
        <button
          className="btn btn-primary"
          style={{ background: mode === "pressure" ? "#dc2626" : "#d97706", borderColor: mode === "pressure" ? "#dc2626" : "#d97706" }}
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
        >
          Next →
        </button>
        <button className="btn" style={{ marginLeft: "auto" }} onClick={copyStep}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <span style={{ fontSize: 11, color: "var(--text-3)", alignSelf: "center" }}>
          {step + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

type Tab = "actions" | "compose" | "history";

interface Props {
  prospect:   Prospect;
  onClose:    () => void;
  onDeleted?: () => void;
}

export default function ProspectModal({ prospect: initialProspect, onClose, onDeleted }: Props) {
  const [prospect, setProspect] = useState(initialProspect);
  const [tab, setTab]             = useState<Tab>("actions");
  const [showScript, setShowScript]           = useState(false);
  const [showEmailScript, setShowEmailScript] = useState(false);
  const [showSignalScript, setShowSignalScript] = useState(false);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [confirmDelete, setConfirmDelete]     = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync if parent re-passes a new prospect
  useEffect(() => setProspect(initialProspect), [initialProspect]);

  // Refetch prospect from API to pick up freshly recalculated scores
  async function refreshProspect() {
    try {
      const res = await fetch(`/api/contacts/${prospect.id}`, { cache: "no-store" });
      if (res.ok) {
        const updated = await res.json() as Prospect;
        setProspect(updated);
      }
    } catch { /* keep current state */ }
  }

  async function deleteContact() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${prospect.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted?.();
        onClose();
      }
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const r          = rScore(prospect);
  const band       = rBand(r);
  const code       = stateCode[prospect.state];
  const sband      = scoreBand(prospect.signalStack);
  const phone      = parsePhone(prospect.phone);
  const hasEmail   = !!prospect.email;
  const hasPhone   = !!phone;
  const linkedInQ  = encodeURIComponent(`${prospect.name} ${prospect.company}`);

  // Build draft email body for "Approve & send"
  function openEmail() {
    const opener  = emailOpener(prospect.name, prospect.state);
    const subject = encodeURIComponent(emailSubject(prospect.state));
    const body    = encodeURIComponent(`${opener}[Your message here]\n\nBest,\nChris\nPivot Training`);
    window.open(`mailto:${prospect.email}?subject=${subject}&body=${body}`, "_self");
  }

  function openPhone() {
    if (!phone) return;
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
  }

  function openLinkedIn() {
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${linkedInQ}`, "_blank", "noopener");
  }

  function exportCSV() {
    const rows = [
      ["Name", "Title", "Company", "Email", "Phone", "Industry", "Signal Score", "Intent", "R-Score", "NSS State", "Last Touch Days Ago", "Next Move"],
      [prospect.name, prospect.title, prospect.company, prospect.email ?? "", prospect.phone ?? "", prospect.industry,
       prospect.signalStack, prospect.intentVelocity, Math.round(r), prospect.state, prospect.lastTouchDaysAgo, prospect.nextMove],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${prospect.name.replace(/\s+/g, "-")}-signaliq.csv`;
    a.click();
  }

  const ACTION_BTN: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
    padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line-2)",
    background: "var(--bg-2)", cursor: "pointer", fontSize: 11.5,
    color: "var(--text-1)", transition: "all 0.15s", minWidth: 72,
  };

  const ACTION_BTN_DISABLED: React.CSSProperties = {
    ...ACTION_BTN, opacity: 0.3, cursor: "not-allowed",
  };

  return (
    <div
      ref={backdropRef}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 740,
        maxHeight: "90vh", overflowY: "auto",
        background: "var(--bg-1)", borderRadius: 18,
        border: "1px solid var(--line-2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--line)",
          display: "flex", gap: 14, alignItems: "flex-start",
          background: "var(--bg-2)", borderRadius: "18px 18px 0 0",
        }}>
          <div className={`avatar ${code}`} style={{ width: 46, height: 46, fontSize: 15, flexShrink: 0 }}>
            {prospect.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", marginBottom: 2 }}>
              {prospect.name}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
              {[prospect.title, prospect.company, prospect.industry].filter(Boolean).join(" · ")}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <StateBadge state={prospect.state} />
              <span style={{
                padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                background: `${sband.color}18`, color: sband.color,
              }}>{sband.label} {prospect.signalStack}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                R-Score <span className={`rscore ${band}`}>{Math.round(r)}</span>
                {" · "}{rBandLabel(r)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: "var(--bg-3)", color: "var(--text-2)", fontSize: 16,
              cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        <div style={{
          padding: "14px 24px", borderBottom: "1px solid var(--line)",
          display: "flex", gap: 8, flexWrap: "wrap",
        }}>
          {/* Email — always available, toggles script panel */}
          <button
            style={{
              ...ACTION_BTN,
              background: showEmailScript ? "var(--accent)" : "var(--bg-2)",
              color: showEmailScript ? "#fff" : "var(--text-1)",
            }}
            onClick={() => { setShowEmailScript(s => !s); setShowScript(false); }}
            title={hasEmail ? `Email script for ${prospect.name}` : "Email script — no address on file, copy & paste"}
          >
            <span style={{ fontSize: 18 }}>📧</span>
            {hasEmail ? "Email script" : "Email script ✱"}
          </button>

          {/* Call */}
          <button
            style={hasPhone ? ACTION_BTN : ACTION_BTN_DISABLED}
            onClick={hasPhone ? openPhone : undefined}
            title={hasPhone ? `Call ${phone}` : "No phone on file"}
          >
            <span style={{ fontSize: 18 }}>📞</span>
            {hasPhone ? phone!.replace(/\s+/g, " ").slice(0, 14) : "No number"}
          </button>

          {/* LinkedIn */}
          <button style={ACTION_BTN} onClick={openLinkedIn} title={`Find ${prospect.name} on LinkedIn`}>
            <span style={{ fontSize: 18 }}>💼</span>
            LinkedIn
          </button>

          {/* Call script */}
          <button
            style={{ ...ACTION_BTN, background: showScript ? "var(--accent)" : "var(--bg-2)", color: showScript ? "#fff" : "var(--text-1)" }}
            onClick={() => { setShowScript(s => !s); setShowEmailScript(false); }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            Call script
          </button>

          {/* Signal script — PressureIQ / BurnoutIQ */}
          {(() => {
            const hasPressure = prospect.timingWindow >= 60 || prospect.intentVelocity >= 70;
            const hasBurnout  = prospect.state === "dorsal" && prospect.lastTouchDaysAgo >= 21;
            const hasSignal   = hasPressure || hasBurnout;
            const signalColor = hasPressure ? "#ef4444" : "#f59e0b";
            return (
              <button
                style={{
                  ...ACTION_BTN,
                  background: showSignalScript
                    ? (hasPressure ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)")
                    : "var(--bg-2)",
                  borderColor: showSignalScript ? signalColor : hasSignal ? signalColor + "60" : "var(--line-2)",
                  color: showSignalScript ? signalColor : hasSignal ? signalColor : "var(--text-2)",
                  position: "relative",
                }}
                onClick={() => { setShowSignalScript(s => !s); setShowScript(false); setShowEmailScript(false); }}
                title="PressureIQ / BurnoutIQ signal-based selling scripts"
              >
                {hasSignal && !showSignalScript && (
                  <span style={{
                    position: "absolute", top: 6, right: 6,
                    width: 7, height: 7, borderRadius: "50%",
                    background: signalColor, border: "1.5px solid var(--bg-1)",
                  }} />
                )}
                <span style={{ fontSize: 18 }}>{hasBurnout && !hasPressure ? "🟡" : "🔴"}</span>
                Signal script
              </button>
            );
          })()}

          {/* Export */}
          <button style={ACTION_BTN} onClick={exportCSV}>
            <span style={{ fontSize: 18 }}>📤</span>
            Export
          </button>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              style={{ ...ACTION_BTN, color: "var(--text-3)", marginLeft: "auto" }}
              onClick={() => setConfirmDelete(true)}
              title="Delete this contact"
            >
              <span style={{ fontSize: 18 }}>🗑</span>
              Delete
            </button>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>Remove {prospect.name}?</span>
              <button
                className="btn"
                style={{ padding: "6px 12px", fontSize: 12, background: "#ef4444", color: "#fff", border: "none", opacity: deleting ? 0.6 : 1 }}
                onClick={deleteContact}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button className="btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Email script panel (collapsible) ───────────────── */}
        {showEmailScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <EmailScriptPanel prospect={prospect} />
          </div>
        )}

        {/* ── Call script panel (collapsible) ────────────────── */}
        {showScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <CallScriptPanel prospect={prospect} />
          </div>
        )}

        {/* ── Signal script panel — PressureIQ / BurnoutIQ ───── */}
        {showSignalScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <SignalScriptPanel prospect={prospect} />
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="tab-row">
          {(["actions", "compose", "history"] as const).map(t => (
            <button
              key={t}
              className={`tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "actions" ? "Actions" : t === "compose" ? "AI Draft" : "History"}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────────── */}
        <div style={{ padding: "20px 24px", flex: 1 }}>

          {/* ACTIONS tab */}
          {tab === "actions" && (
            <div>
              {/* Next move */}
              <div style={{
                padding: "14px 16px", borderRadius: 10, marginBottom: 16,
                background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
                border: "1px solid rgba(245,158,11,0.2)",
              }}>
                <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--sympathetic)", marginBottom: 6, fontWeight: 600 }}>
                  Recommended next move
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-0)", lineHeight: 1.6, marginBottom: 8 }}>
                  <strong>{nextMoveFor[prospect.state]}</strong>
                </div>
                {prospect.nextMove && (
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6, borderTop: "1px solid rgba(245,158,11,0.15)", paddingTop: 8, marginTop: 4 }}>
                    <span style={{ color: "var(--text-3)", fontSize: 11 }}>CRM note: </span>
                    {prospect.nextMove}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 6 }}>
                  ✗ Avoid: {forbiddenFor[prospect.state]}
                </div>
              </div>

              {/* Priority score — simplified 3-bar view */}
              <div style={{ marginBottom: 20 }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", fontWeight: 600 }}>
                    Priority score
                  </div>
                  <span style={{
                    marginLeft: 8, padding: "2px 10px", borderRadius: 20,
                    fontSize: 12, fontWeight: 700,
                    background: band === "high" ? "rgba(34,197,94,0.12)" : band === "mid" ? "rgba(234,179,8,0.10)" : "rgba(148,163,184,0.10)",
                    color: band === "high" ? "#22c55e" : band === "mid" ? "#ca8a04" : "#64748b",
                  }}>
                    {band === "high" ? "High" : band === "mid" ? "Mid" : "Low"} · {Math.round(r)}
                  </span>
                  <button
                    onClick={() => setShowScoreDetail(s => !s)}
                    style={{
                      marginLeft: "auto", background: "none", border: "none",
                      cursor: "pointer", fontSize: 11.5, color: "var(--text-3)",
                      padding: "2px 6px",
                    }}
                  >
                    {showScoreDetail ? "Hide detail ↑" : "Show detail ↓"}
                  </button>
                </div>

                {/* 3 grouped bars — always visible */}
                <ScoreBar
                  label="Activity — how recently & often you've engaged"
                  value={Math.round(prospect.signalStack * 0.6 + prospect.socialProofAlignment * 0.4)}
                  weight=""
                />
                <ScoreBar
                  label="Interest — buying signals & intent"
                  value={Math.round(prospect.intentVelocity * 0.6 + prospect.timingWindow * 0.4)}
                  weight=""
                />
                <ScoreBar
                  label="Fit — budget, authority & timing"
                  value={Math.round(prospect.budgetIndicator * 0.4 + prospect.authorityMatch * 0.35 + prospect.timingWindow * 0.25)}
                  weight=""
                />

                {/* Full breakdown — toggle */}
                {showScoreDetail && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--text-3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Full breakdown
                    </div>
                    <ScoreBar label="Signal stack"     value={prospect.signalStack}         weight="0.25" />
                    <ScoreBar label="Intent velocity"  value={prospect.intentVelocity}       weight="0.20" />
                    <ScoreBar label="Budget indicator" value={prospect.budgetIndicator}      weight="0.15" />
                    <ScoreBar label="Authority match"  value={prospect.authorityMatch}       weight="0.15" />
                    <ScoreBar label="Timing window"    value={prospect.timingWindow}         weight="0.15" />
                    <ScoreBar label="Social proof"     value={prospect.socialProofAlignment} weight="0.10" />
                  </div>
                )}
              </div>

              {/* Log interaction */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <LogInteraction contactId={prospect.id} onLogged={() => {
                  // Optimistic update + delayed refetch to pick up recalculated scores
                  setProspect(p => ({ ...p, lastTouchDaysAgo: 0 }));
                  setTimeout(refreshProspect, 1800);
                }} />
              </div>
            </div>
          )}

          {/* AI COMPOSE tab */}
          {tab === "compose" && (
            <div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.6 }}>
                AI drafts are calibrated to <strong style={{ color: "var(--text-1)" }}>{prospect.name}</strong>'s current NSS state ({stateLabel[prospect.state]}).
                {hasEmail && <span> Hit <strong style={{ color: "var(--accent)" }}>Approve & send</strong> to open your mail app with the draft pre-loaded.</span>}
                {!hasEmail && <span style={{ color: "var(--sympathetic)" }}> No email on file — copy the draft and send manually.</span>}
              </div>
              <Composer prospect={prospect} email={prospect.email} />
            </div>
          )}

          {/* HISTORY tab */}
          {tab === "history" && (
            <div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 14 }}>
                {prospect.interactions.length} interactions · last touch {prospect.lastTouchDaysAgo}d ago
              </div>
              {prospect.interactions.length === 0 ? (
                <div className="empty" style={{ textAlign: "center", color: "var(--text-2)", padding: 24 }}>
                  No interactions logged yet. Use the Actions tab to log the first touch.
                </div>
              ) : prospect.interactions.map(i => (
                <div key={i.id} className="feed-item" style={{ borderRadius: 8, marginBottom: 6 }}>
                  <div className="feed-icon">{i.channel === "email" ? "✉️" : i.channel === "call" ? "📞" : "💼"}</div>
                  <div className="feed-body">
                    <div className="feed-text">
                      {i.direction === "in" ? "← Reply" : "→ Sent"} · {i.channel} · {i.at}
                    </div>
                    <div className="feed-meta">{i.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
