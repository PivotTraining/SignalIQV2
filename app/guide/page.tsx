"use client";
import { useState } from "react";

const ACCENT  = "var(--accent)";
const ACCENT2 = "var(--accent-2)";

interface Section {
  id:    string;
  emoji: string;
  title: string;
  body:  React.ReactNode;
}

const sections: Section[] = [
  {
    id: "overview",
    emoji: "🧠",
    title: "What is SignalIQ?",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          SignalIQ is a live sales intelligence layer built for Pivot Training. It reads the
          <strong> nervous system state</strong> of every prospect in your book — not just who
          opened an email, but <em>how ready they are to say yes</em> — and scores them so you
          know exactly where to spend your time each day.
        </p>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          It's built on <strong>polyvagal theory</strong>: buyers aren't just rational. They're
          regulated or dysregulated. The wrong message at the wrong moment creates resistance.
          SignalIQ tells you who's Engaged (open and ready), who's Cautious (guarded or hesitant),
          and who's Quiet (disengaged or ghosting) — so you match your energy to theirs.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
          {[
            { color: "var(--ventral)", label: "Engaged", desc: "Open, curious, collaborative. Ask directly. Invite to a meeting." },
            { color: "var(--sympathetic)", label: "Cautious", desc: "Guarded, on edge. Pattern interrupt, curiosity hook — no pitch." },
            { color: "var(--dorsal)", label: "Quiet", desc: "Gone silent, disengaged. Low-stakes re-entry, no ask, no urgency." },
          ].map(s => (
            <div key={s.label} style={{
              padding: 14,
              borderRadius: 10,
              border: `1px solid ${s.color}33`,
              background: `${s.color}0d`,
            }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "score",
    emoji: "📊",
    title: "Reading the Signal Score",
    body: (
      <div>
        <p style={{ marginBottom: 16, lineHeight: 1.7 }}>
          Every contact has a <strong>Signal Score</strong> (1–100). It updates every time you
          run a sweep. The formula:
        </p>
        <div style={{
          padding: "16px 20px",
          borderRadius: 10,
          background: "var(--bg-2)",
          border: "1px solid var(--line)",
          fontFamily: "SF Mono, Menlo, monospace",
          fontSize: 13,
          marginBottom: 20,
          lineHeight: 2,
        }}>
          <span style={{ color: ACCENT }}>Signal</span> = Recency <span style={{ color: "var(--text-3)" }}>×0.35</span>
          + Social Proof <span style={{ color: "var(--text-3)" }}>×0.30</span>
          + Intent <span style={{ color: "var(--text-3)" }}>×0.20</span>
          + Authority Match <span style={{ color: "var(--text-3)" }}>×0.15</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { term: "Recency", def: "Exponential decay from last touch. Halves roughly every 30 days. Touch recently = high score." },
            { term: "Social Proof", def: "Quality of the lead source. Returning client = 90. Cold outreach = 30." },
            { term: "Intent", def: "How ready they are to buy. Set in CRM. Range 0–100." },
            { term: "Authority Match", def: "Are they the decision maker? Director/VP = high. Unknown title = mid." },
          ].map(i => (
            <div key={i.term} style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: ACCENT2 }}>{i.term}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{i.def}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { band: "🔥 Hot", range: "80–100", color: "#f97316", action: "Reach out today" },
            { band: "⚡ Warm", range: "60–79",  color: "#eab308", action: "Nurture this week" },
            { band: "🌡 Cooling", range: "40–59", color: "#6366f1", action: "Re-engage soon" },
            { band: "❄️ Cold", range: "20–39",  color: "#64748b", action: "Low priority" },
          ].map(b => (
            <div key={b.band} style={{ padding: "10px 12px", borderRadius: 8, background: `${b.color}11`, border: `1px solid ${b.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.band}</div>
              <div style={{ fontSize: 11, color: "var(--text-2)", margin: "4px 0" }}>{b.range}</div>
              <div style={{ fontSize: 11, color: "var(--text-1)" }}>{b.action}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "sweep",
    emoji: "⚡",
    title: "Running a Signal Sweep",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          A <strong>Signal Sweep</strong> recalculates every contact's score in real time using
          today's date. Because Recency decays daily, a contact you touched 7 days ago scores
          differently than one you touched 30 days ago — run the sweep every morning to see
          who's rising and who's going cold.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {[
            { step: "1", text: "Go to Command Center or Prospects page" },
            { step: "2", text: 'Click "Run signal sweep" — top right' },
            { step: "3", text: "Wait ~5 seconds while all 180 scores update" },
            { step: "4", text: "List re-sorts — hottest contacts rise to top" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}, #9370ff)`,
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
              }}>{s.step}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-1)" }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "prospects",
    emoji: "👥",
    title: "Working the Prospects List",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          The Prospects page shows all 180 contacts sorted by R-Score (a composite of all
          six dimensions). Use it as your daily priority queue.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          {[
            {
              icon: "🖱",
              title: "Click any row",
              desc: "Opens the full contact detail — NSS state, score breakdown, interaction history, and message composer.",
            },
            {
              icon: "💬",
              title: "Log an interaction",
              desc: 'Scroll to "Log interaction" on the detail page. Pick channel (email/call/LinkedIn), direction (in/out), and depth (1=surface, 5=deep). This updates the NSS state.',
            },
            {
              icon: "📤",
              title: "Export a contact",
              desc: 'Click "Export" on the detail page to download a CSV of that contact\'s data.',
            },
            {
              icon: "📥",
              title: "Import a new list",
              desc: 'Click "Import list" and pick a CSV. New contacts are deduped by email (or name + company) and added to Supabase.',
            },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "nss",
    emoji: "🧬",
    title: "NSS Monitor — Polyvagal States",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          The NSS Monitor groups your book by nervous system state. The state is inferred
          automatically from your logged interactions — specifically from the <em>content</em> of
          inbound replies.
        </p>
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sympathetic)", marginBottom: 4 }}>Why most contacts start as Quiet</div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>
            If a contact has no inbound reply logged, the model defaults to Quiet (disengaged).
            This is accurate — they haven't responded yet. Log their replies as interactions
            and the state will update immediately.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { state: "Engaged 🟢", do: "Direct ask, meeting invite, pricing conversation", dont: "Over-nurturing, redundant check-ins" },
            { state: "Cautious 🟡", do: "Pattern interrupt, curiosity hook, zero-pressure", dont: "Pitch decks, feature lists, hard CTAs" },
            { state: "Quiet 🔵", do: "Permission-to-reconnect message, no ask", dont: "Any ask, any urgency, 'just checking in'" },
          ].map(s => (
            <div key={s.state} style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{s.state}</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, fontSize: 12, color: "var(--ventral)" }}>✓ {s.do}</div>
                <div style={{ flex: 1, fontSize: 12, color: "var(--danger)" }}>✗ {s.dont}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "feed",
    emoji: "📡",
    title: "Signal Feed — Reading Events",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          The Signal Feed surfaces three types of events, prioritized for action.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "🔥", type: "Signal Alert", color: "#f97316", desc: "Hot or warm contacts (score ≥75). These are your top priorities today. Click Open to go directly to their profile." },
            { icon: "✉️", type: "Outreach",     color: "var(--accent)", desc: "Interactions logged in the system — emails sent, calls made, LinkedIn touches. Click Open to see the contact detail and follow up." },
            { icon: "🔔", type: "Re-engage",    color: "#a855f7", desc: "Contacts that have gone quiet (60+ days since last touch) but still have enough signal to revive. Act before they go fully cold." },
          ].map(e => (
            <div key={e.type} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: e.color, marginBottom: 3 }}>{e.type}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>
          Use the filter buttons (All / Alert / Outreach / Re-engage) to focus the feed.
        </p>
      </div>
    ),
  },
  {
    id: "sync",
    emoji: "🔄",
    title: "Jazmine & Cross-Device Sync",
    body: (
      <div>
        <p style={{ marginBottom: 14, lineHeight: 1.7 }}>
          SignalIQ is fully cloud-synced via <strong>Supabase</strong>. Chris and Jazmine
          share one live database — anything either of you logs appears for the other within
          2 minutes (the auto-refresh interval).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { q: "How do I share access?", a: "Just share the URL: https://signaliq-ruddy.vercel.app — it works on any device, any browser." },
            { q: "Will my changes conflict?", a: "No. Each update is scoped to a single contact. You can both be in the app at the same time without conflicts." },
            { q: "How often does data refresh?", a: "The Prospects and NSS pages auto-refresh every 2 minutes. For instant refresh, run a Signal Sweep — it also triggers a reload." },
            { q: "Is the data backed up?", a: "Yes. Supabase runs on Postgres with daily backups on the free tier. Your 180 contacts are safe." },
          ].map(item => (
            <div key={item.q} style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.q}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function GuidePage() {
  const [active, setActive] = useState("overview");
  const current = sections.find(s => s.id === active) ?? sections[0];

  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">How to Use SignalIQ</h1>
          <p className="page-sub">Everything you need to run your book of business with polyvagal intelligence.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left nav */}
        <div className="card" style={{ position: "sticky", top: 24 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "11px 16px",
                border: "none",
                borderLeft: `3px solid ${active === s.id ? "var(--accent)" : "transparent"}`,
                background: active === s.id ? "var(--bg-2)" : "transparent",
                color: active === s.id ? "var(--text-0)" : "var(--text-2)",
                fontSize: 13,
                fontWeight: active === s.id ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s",
              }}
            >
              <span>{s.emoji}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                {current.emoji} {current.title}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{
                    width: 8, height: 8,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: s.id === active ? "var(--accent)" : "var(--bg-3)",
                    padding: 0,
                    transition: "background 0.15s",
                  }}
                  aria-label={s.title}
                />
              ))}
            </div>
          </div>
          <div style={{ padding: 24 }}>
            {current.body}
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--line)",
          }}>
            <button
              className="btn"
              disabled={sections.findIndex(s => s.id === active) === 0}
              onClick={() => {
                const i = sections.findIndex(s => s.id === active);
                if (i > 0) setActive(sections[i - 1].id);
              }}
              style={{ opacity: sections.findIndex(s => s.id === active) === 0 ? 0.3 : 1 }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>
              {sections.findIndex(s => s.id === active) + 1} / {sections.length}
            </span>
            <button
              className="btn btn-primary"
              disabled={sections.findIndex(s => s.id === active) === sections.length - 1}
              onClick={() => {
                const i = sections.findIndex(s => s.id === active);
                if (i < sections.length - 1) setActive(sections[i + 1].id);
              }}
              style={{ opacity: sections.findIndex(s => s.id === active) === sections.length - 1 ? 0.3 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
