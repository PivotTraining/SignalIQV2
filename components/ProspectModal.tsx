"use client";
import { useEffect, useState, useRef } from "react";
import type { Prospect } from "@/lib/types";
import { rBand, rScore, rBandLabel } from "@/lib/rscore";
import { getCallScript, getEmailScript, NSS_TONE } from "@/lib/callScripts";
import Composer from "./Composer";
import LogInteraction from "./LogInteraction";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePhone(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(";")[0].trim();
  const clean = first.replace(/\s*ext\.?\s*\d+/gi, "").trim();
  return clean.replace(/[^\d+\-()\s]/g, "").trim() || null;
}

function emailSubject(prospect: Prospect): string {
  const script = getEmailScript(prospect.industry);
  return script.subjects[0]
    .replace(/\[FirstName\]/g, prospect.name.split(" ")[0])
    .replace(/\[Company\]/g, prospect.company);
}

function emailOpenerBody(prospect: Prospect): string {
  const script = getEmailScript(prospect.industry);
  const first = prospect.name.split(" ")[0];
  return script.cold.body
    .replace(/\[FirstName\]/g, first)
    .replace(/\[Name\]/g, prospect.name)
    .replace(/\[Company\]/g, prospect.company);
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
          {prospect.industry || "General"}
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

type EmailTab = "cold" | "followup" | "reengage";

function EmailScriptPanel({ prospect }: { prospect: Prospect }) {
  const script = getEmailScript(prospect.industry);
  const first  = prospect.name.split(" ")[0];
  const [subIdx, setSubIdx]     = useState(0);
  const [emailTab, setEmailTab] = useState<EmailTab>("cold");
  const [copied, setCopied]     = useState<"subject" | "body" | "all" | null>(null);

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

  const TAB_LABELS: Record<EmailTab, string> = {
    cold:     "Cold",
    followup: "Follow-up",
    reengage: "Re-engage",
  };

  const emailBody = script[emailTab];
  const subject   = fill(script.subjects[subIdx] ?? "");
  const body      = fill(emailBody.body);
  const ps        = emailBody.ps ? fill(emailBody.ps) : null;
  const fullText  = `Subject: ${subject}\n\n${body}${ps ? `\n\nP.S. ${ps}` : ""}`;

  function copy(what: "subject" | "body" | "all") {
    const text = what === "subject" ? subject : what === "body" ? body + (ps ? `\n\nP.S. ${ps}` : "") : fullText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function sendEmail() {
    if (!prospect.email) return;
    const sub = encodeURIComponent(subject);
    const bod = encodeURIComponent(body + (ps ? `\n\nP.S. ${ps}` : ""));
    window.open(`mailto:${prospect.email}?subject=${sub}&body=${bod}`, "_self");
  }

  const accentColor = "var(--accent)";

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Email type tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["cold", "followup", "reengage"] as EmailTab[]).map(t => (
          <button
            key={t}
            onClick={() => setEmailTab(t)}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: `1px solid ${emailTab === t ? "var(--accent)" : "var(--line-2)"}`,
              background: emailTab === t ? "var(--accent)" : "var(--bg-3)",
              color: emailTab === t ? "#fff" : "var(--text-2)",
              fontWeight: emailTab === t ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
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
                background: subIdx === i ? "rgba(124,92,255,0.08)" : "var(--bg-2)",
                border: `1px solid ${subIdx === i ? "rgba(124,92,255,0.4)" : "var(--line-2)"}`,
                transition: "all 0.12s",
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${subIdx === i ? "var(--accent)" : "var(--line-2)"}`,
                background: subIdx === i ? "var(--accent)" : "transparent",
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
                  style={{ marginLeft: "auto", fontSize: 11, background: "none", border: "none", cursor: "pointer", color: copied === "subject" ? accentColor : "var(--text-3)" }}
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
            style={{ marginLeft: "auto", fontSize: 11, background: "none", border: "none", cursor: "pointer", color: copied === "body" ? accentColor : "var(--text-3)" }}
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
        <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: accentColor, marginBottom: 8, fontWeight: 600 }}>
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

// ── Product Script panel ──────────────────────────────────────────────────────

type ProductTab = "assessment" | "speaking" | "workshop";

interface ProductStep {
  label: string;
  emoji: string;
  tip:   string;
  text:  string;
}

const PRODUCT_STEPS: Record<ProductTab, ProductStep[]> = {
  assessment: [
    {
      label: "Gatekeeper",
      emoji: "🚪",
      tip: "Don't mention 'assessment' or 'training' — say workforce diagnostic. It sounds different.",
      text: "Hi, this is Chris Davis — is [Name] available? [If asked:] I work with organizations on a workforce diagnostic — just a quick question for them.",
    },
    {
      label: "Opener",
      emoji: "👋",
      tip: "Lead with curiosity about how they currently measure burnout — most don't. That's your opening.",
      text: "Hey [Name], Chris Davis — quick question for you. We just launched a diagnostic assessment that's been getting a lot of attention from HR leaders right now. I'll be quick — you have two minutes?",
    },
    {
      label: "Discovery",
      emoji: "🔍",
      tip: "The word 'measuring' is key. Most orgs don't measure burnout — they react to it. That gap is your in.",
      text: "Here's what I want to understand first: when it comes to your team, is burnout something you're actively measuring right now, or is it more of a 'we'll know it when we see it' situation? ... [Listen.] ... And when it does show up — what does that cost you? Turnover, performance issues, sick days?",
    },
    {
      label: "Pitch",
      emoji: "🎯",
      tip: "The word 'proactive' is the hook. Everyone else is reactive. That contrast does the work.",
      text: "So what we built — PressureIQ — is a 15-minute assessment your team takes individually. It measures exactly where pressure tolerance is breaking down and who's at risk before it becomes a retention problem. You get a dashboard that shows leadership where the weak points are and what to do about them. It's proactive instead of reactive. Most companies are flying blind on this.",
    },
    {
      label: "Close",
      emoji: "🤙",
      tip: "The sample report close is low-friction. You're not asking for a decision — you're asking for a look.",
      text: "Here's what I'd suggest — let me send you a sample report so you can see exactly what the output looks like. If it's relevant, we get on a call and I'll show you how to run it for your team. Would that be worth 20 minutes?",
    },
  ],
  speaking: [
    {
      label: "Gatekeeper",
      emoji: "🚪",
      tip: "Event coordinators get pitched constantly. Sound specific, not generic.",
      text: "Hi, this is Chris Davis — is [Name] available? [If asked:] I work with organizations and conferences as a keynote speaker — just a quick question.",
    },
    {
      label: "Opener",
      emoji: "👋",
      tip: "Ask about their audience/event before pitching — shows you care about fit, not just a booking.",
      text: "Hey [Name], Chris Davis. I'll be upfront — I'm a speaker and I had a specific reason I wanted to connect with you. The topic I speak on is one that I think your audience is dealing with right now. Two minutes?",
    },
    {
      label: "Discovery",
      emoji: "🔍",
      tip: "The phrase 'running out of capacity' is more specific than burnout. It lands differently with high performers.",
      text: "What's your team or audience dealing with most right now on the performance side? Because the events and organizations that have brought me in are all dealing with a version of the same thing — people who are technically excellent and running out of capacity to keep performing at that level. Is that a conversation your group needs?",
    },
    {
      label: "Pitch",
      emoji: "🎯",
      tip: "'Tools, not just feelings' is the differentiator. Most speakers leave people inspired. Chris leaves them equipped.",
      text: "What I do on stage is different from a standard motivational talk. I give people a framework they can actually use — not inspiration that wears off in 48 hours. The talk is built around what happens to human performance under sustained pressure and what to do about it. People leave with tools, not just feelings. I've spoken to school districts, corporate teams, associations, health systems. The topic lands differently depending on the room and I adapt it.",
    },
    {
      label: "Close",
      emoji: "🤙",
      tip: "The one-sheet + clip close is the right ask for a first conversation. Don't ask for a booking yet.",
      text: "I'd love to send you my speaker one-sheet and a clip. If you're planning an event or know someone who is — I think it's worth a look. Can I send it over?",
    },
  ],
  workshop: [
    {
      label: "Gatekeeper",
      emoji: "🚪",
      tip: "Keep the gatekeeper question short. The less you say here, the better.",
      text: "Hi, this is Chris Davis — is [Name] available? [If asked:] I work with teams on experiential training — quick question for them.",
    },
    {
      label: "Opener",
      emoji: "👋",
      tip: "The word 'specific' signals you're not pitching a generic program. It buys you two minutes.",
      text: "Hey [Name], Chris Davis — I'll be quick. I work with teams on something specific and I wanted to see if it's relevant for your group right now. Two minutes?",
    },
    {
      label: "Discovery",
      emoji: "🔍",
      tip: "Ask for the unpolished answer. 'I'm not asking for the polished answer' gives them permission to be honest.",
      text: "So — when your team is under pressure, what does that look like? Do people go quiet, does communication break down, does performance dip? I'm not asking for the polished answer — what does it actually look like? ... [Listen.] ... And has anything been done to address it, or has it just been managed around?",
    },
    {
      label: "Pitch",
      emoji: "🎯",
      tip: "Experiential is the differentiator — emphasize they're doing things, not just listening. That's what makes it stick.",
      text: "What we do is a half-day or full-day workshop that's not lecture-style. It's experiential — your team is doing things, not just listening. They leave with specific tools for managing pressure in real time: how to stay effective when things get hard, how to communicate when the stakes are high, how to recover fast instead of staying depleted. The results show up in the room, not three months later.",
    },
    {
      label: "Close",
      emoji: "🤙",
      tip: "A 20-minute call with a walk-through is a soft ask. You're customizing it to them — that's the value.",
      text: "Here's what I'd suggest — let me send you our workshop overview and a few outcomes from teams similar to yours. If it resonates, we get on a 20-minute call and I'll walk you through what it looks like for your specific group. Does that sound reasonable?",
    },
  ],
};

function ProductScriptPanel({ prospect }: { prospect: Prospect }) {
  const first = prospect.name.split(" ")[0];
  const [tab, setTab]   = useState<ProductTab>("assessment");
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = PRODUCT_STEPS[tab];

  function fill(text: string) {
    return text
      .replace(/\[Name\]/g, first)
      .replace(/\[Company\]/g, prospect.company);
  }

  function copyStep() {
    navigator.clipboard.writeText(fill(steps[step].text)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Reset step when tab changes
  function switchTab(t: ProductTab) {
    setTab(t);
    setStep(0);
  }

  const TAB_LABELS: Record<ProductTab, string> = {
    assessment: "Assessment",
    speaking:   "Speaking",
    workshop:   "Workshops",
  };

  const TAB_COLORS: Record<ProductTab, string> = {
    assessment: "#7c5cff",
    speaking:   "#0ea5e9",
    workshop:   "#10b981",
  };

  const color = TAB_COLORS[tab];

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Product tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["assessment", "speaking", "workshop"] as ProductTab[]).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12.5, cursor: "pointer",
              border: `1px solid ${tab === t ? TAB_COLORS[t] : "var(--line-2)"}`,
              background: tab === t ? TAB_COLORS[t] + "18" : "var(--bg-3)",
              color: tab === t ? TAB_COLORS[t] : "var(--text-2)",
              fontWeight: tab === t ? 700 : 400,
              transition: "all 0.15s",
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 11.5, cursor: "pointer",
            border: `1px solid ${step === i ? color : "var(--line-2)"}`,
            background: step === i ? color + "18" : "var(--bg-3)",
            color: step === i ? color : "var(--text-2)",
            fontWeight: step === i ? 700 : 400,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
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
          style={{ background: color, border: "none" }}
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
  const [tab, setTab]                         = useState<Tab>("actions");
  const [showScript, setShowScript]           = useState(false);
  const [showEmailScript, setShowEmailScript] = useState(false);
  const [showProductScript, setShowProductScript] = useState(false);
  const [confirmDelete, setConfirmDelete]     = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => setProspect(initialProspect), [initialProspect]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const r          = rScore(prospect);
  const band       = rBand(r);
  const phone      = parsePhone(prospect.phone);
  const hasEmail   = !!prospect.email;
  const hasPhone   = !!phone;
  const linkedInQ  = encodeURIComponent(`${prospect.name} ${prospect.company}`);

  const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    high: { bg: "rgba(34,197,94,0.12)",   color: "#22c55e", label: "High" },
    mid:  { bg: "rgba(234,179,8,0.10)",   color: "#ca8a04", label: "Mid"  },
    low:  { bg: "rgba(148,163,184,0.10)", color: "#64748b", label: "Low"  },
  };
  const ps = PRIORITY_STYLE[band] ?? PRIORITY_STYLE.low;

  function openEmail() {
    const subject = encodeURIComponent(emailSubject(prospect));
    const body    = encodeURIComponent(emailOpenerBody(prospect));
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
      ["Name", "Title", "Company", "Email", "Phone", "Industry", "Signal Score", "Intent", "R-Score", "Last Touch Days Ago", "Next Move"],
      [prospect.name, prospect.title, prospect.company, prospect.email ?? "", prospect.phone ?? "", prospect.industry,
       prospect.signalStack, prospect.intentVelocity, Math.round(r), prospect.lastTouchDaysAgo, prospect.nextMove],
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

  // Avatar color from NSS state
  const stateClass = prospect.state === "ventral" ? "v" : prospect.state === "sympathetic" ? "s" : "d";

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
          <div className={`avatar ${stateClass}`} style={{ width: 46, height: 46, fontSize: 15, flexShrink: 0 }}>
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
              <span style={{
                padding: "3px 10px", borderRadius: 20,
                fontSize: 12, fontWeight: 700,
                background: ps.bg, color: ps.color,
              }}>
                Priority: {ps.label}
              </span>
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
          {/* Email */}
          <button
            style={{
              ...ACTION_BTN,
              background: showEmailScript ? "var(--accent)" : "var(--bg-2)",
              color: showEmailScript ? "#fff" : "var(--text-1)",
            }}
            onClick={() => {
              setShowEmailScript(s => !s);
              setShowScript(false);
              setShowProductScript(false);
            }}
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
            onClick={() => {
              setShowScript(s => !s);
              setShowEmailScript(false);
              setShowProductScript(false);
            }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            Call script
          </button>

          {/* Products */}
          <button
            style={{
              ...ACTION_BTN,
              background: showProductScript ? "rgba(16,185,129,0.15)" : "var(--bg-2)",
              borderColor: showProductScript ? "#10b981" : "var(--line-2)",
              color: showProductScript ? "#10b981" : "var(--text-1)",
            }}
            onClick={() => {
              setShowProductScript(s => !s);
              setShowScript(false);
              setShowEmailScript(false);
            }}
            title="Product-specific selling scripts"
          >
            <span style={{ fontSize: 18 }}>🎯</span>
            Products
          </button>

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

        {/* ── Email script panel ──────────────────────────────── */}
        {showEmailScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <EmailScriptPanel prospect={prospect} />
          </div>
        )}

        {/* ── Call script panel ───────────────────────────────── */}
        {showScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <CallScriptPanel prospect={prospect} />
          </div>
        )}

        {/* ── Product script panel ────────────────────────────── */}
        {showProductScript && (
          <div style={{ padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
            <ProductScriptPanel prospect={prospect} />
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
              {/* Next move note */}
              {prospect.nextMove && (
                <div style={{
                  padding: "12px 14px", borderRadius: 8, marginBottom: 16,
                  background: "var(--bg-2)", border: "1px solid var(--line)",
                }}>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 6, fontWeight: 600 }}>
                    Next move note
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.6 }}>
                    {prospect.nextMove}
                  </div>
                </div>
              )}

              {/* Log interaction */}
              <div style={{ borderTop: prospect.nextMove ? "1px solid var(--line)" : undefined, paddingTop: prospect.nextMove ? 16 : 0 }}>
                <LogInteraction contactId={prospect.id} onLogged={() => {
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
                AI drafts calibrated for <strong style={{ color: "var(--text-1)" }}>{prospect.name}</strong>.
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
