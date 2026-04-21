import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

const CHANNEL_ICON: Record<string, string> = {
  email:    "✉️",
  call:     "📞",
  linkedin: "💼",
};

const BAND_ICON: Record<string, string> = {
  hot:     "🔥",
  warm:    "⚡",
  cooling: "🌡",
  cold:    "❄️",
  dormant: "💤",
};

// PressureIQ — what's driving urgency at this school right now
const PRESSURE_TRIGGERS = [
  "Budget window open — Q4 purchasing deadline approaching",
  "New state accountability mandate in effect",
  "District improvement plan renewal due",
  "Superintendent change — new leadership, new priorities",
  "Enrollment decline — justifying staff investment critical",
  "State assessment results released — pressure to act",
  "Federal Title I compliance review upcoming",
  "Post-pandemic recovery funding window closing",
  "Board-directed strategic plan requires staff development",
  "Union contract cycle — morale programs in scope",
];

// BurnoutIQ — what the staff exhaustion pattern looks like
const BURNOUT_SIGNALS = [
  "Staff turnover velocity up — retention risk flagged",
  "Absence rate climbing — engagement breakdown pattern",
  "Multiple quiet contacts at same district — systemic burnout",
  "Low reply rate despite outreach — team is overwhelmed",
  "NSS reads quiet across leadership — decision fatigue present",
  "Post-holiday disengagement pattern — energy at floor",
  "Year 3+ teacher cluster showing withdrawal signals",
];

function scoreBand(s: number) {
  if (s >= 80) return "hot";
  if (s >= 60) return "warm";
  if (s >= 40) return "cooling";
  if (s >= 20) return "cold";
  return "dormant";
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// Deterministic pick so it doesn't shuffle on every refresh
function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

export interface FeedEvent {
  id:          string;
  icon:        string;
  html:        string;
  meta:        string;
  contactId:   string;
  contactName: string;
  type:        "outreach" | "signal-alert" | "re-engage" | "score-update" | "pressure" | "burnout";
  ts:          string;
}

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ events: [] });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: contacts } = await db
    .from("contacts")
    .select("id, name, company, industry, state, signal_stack, intent, last_touch, next_move, timing_window, budget_indicator")
    .order("signal_stack", { ascending: false });

  const { data: interactions } = await db
    .from("interactions")
    .select("id, contact_id, date, channel, direction, notes, depth, intent")
    .order("date", { ascending: false })
    .limit(60);

  const contactMap: Record<string, { name: string; company: string; signal_stack: number }> = {};
  for (const c of (contacts ?? [])) {
    contactMap[c.id] = { name: c.name, company: c.company ?? "", signal_stack: c.signal_stack };
  }

  const events: FeedEvent[] = [];

  // 1. Hot / Warm signal alerts
  const alerts = (contacts ?? []).filter(c => c.signal_stack >= 75).slice(0, 8);
  for (const c of alerts) {
    const band  = scoreBand(c.signal_stack);
    const days  = c.last_touch ? daysAgo(c.last_touch) : 999;
    const label = band === "hot" ? "Hot signal" : "Warm signal";
    events.push({
      id:          `alert-${c.id}`,
      icon:        BAND_ICON[band],
      html:        `<strong>${c.name}</strong> (${c.company}) — ${label} · score ${c.signal_stack}`,
      meta:        `Last touch ${days}d ago · intent ${c.intent ?? 50}/100${c.next_move ? ` · Next: ${c.next_move.slice(0, 60)}${c.next_move.length > 60 ? "…" : ""}` : ""}`,
      contactId:   c.id,
      contactName: c.name,
      type:        "signal-alert",
      ts:          c.last_touch ?? new Date().toISOString().slice(0, 10),
    });
  }

  // 2. PressureIQ — education sector contacts with institutional pressure signals
  const EDUCATION_INDUSTRIES = ["Education", "Education Service Center", "K-12", "School District", "Higher Education", "Nonprofit", "Government"];
  const pressureCandidates = (contacts ?? [])
    .filter(c => {
      const isEdu = !c.industry || EDUCATION_INDUSTRIES.some(e => c.industry?.toLowerCase().includes(e.toLowerCase()));
      const hasPressure = (c.timing_window ?? 0) >= 60 || (c.intent ?? 0) >= 70 || (c.budget_indicator ?? 0) >= 65;
      return isEdu && hasPressure;
    })
    .slice(0, 10);

  for (const c of pressureCandidates) {
    const trigger  = pick(PRESSURE_TRIGGERS, c.id + "pressure");
    const urgency  = (c.timing_window ?? 0) >= 80 ? "High urgency" : (c.timing_window ?? 0) >= 60 ? "Moderate urgency" : "Opportunity window";
    const days     = c.last_touch ? daysAgo(c.last_touch) : 999;
    events.push({
      id:          `pressure-${c.id}`,
      icon:        "🎯",
      html:        `<strong>PressureIQ</strong> · <strong>${c.name}</strong> (${c.company}) — ${trigger}`,
      meta:        `${urgency} · Last touch ${days}d ago · timing score ${c.timing_window ?? "—"} · budget indicator ${c.budget_indicator ?? "—"}`,
      contactId:   c.id,
      contactName: c.name,
      type:        "pressure",
      ts:          c.last_touch ?? new Date().toISOString().slice(0, 10),
    });
  }

  // 3. BurnoutIQ — dorsal/quiet contacts + high-interaction contacts gone silent
  const burnoutCandidates = (contacts ?? [])
    .filter(c => {
      const isQuiet    = c.state === "dorsal";
      const goneSilent = c.last_touch && daysAgo(c.last_touch) >= 21;
      return isQuiet && goneSilent;
    })
    .slice(0, 8);

  for (const c of burnoutCandidates) {
    const signal = pick(BURNOUT_SIGNALS, c.id + "burnout");
    const days   = c.last_touch ? daysAgo(c.last_touch) : 999;
    events.push({
      id:          `burnout-${c.id}`,
      icon:        "🔋",
      html:        `<strong>BurnoutIQ</strong> · <strong>${c.name}</strong> (${c.company}) — ${signal}`,
      meta:        `Quiet state · ${days}d since last contact · Approach: low-ask, high-empathy · Do not pitch`,
      contactId:   c.id,
      contactName: c.name,
      type:        "burnout",
      ts:          c.last_touch ?? new Date().toISOString().slice(0, 10),
    });
  }

  // 4. Recent outreach events from interactions
  for (const ix of (interactions ?? []).slice(0, 40)) {
    const contact = contactMap[ix.contact_id];
    if (!contact) continue;
    const icon    = CHANNEL_ICON[ix.channel] ?? "📋";
    const verb    = ix.direction === "out" ? "Outreach sent" : "Reply received";
    const days    = daysAgo(ix.date);
    const daysStr = days === 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
    events.push({
      id:          `ix-${ix.id}`,
      icon,
      html:        `<strong>${contact.name}</strong> · ${verb} via ${ix.channel}`,
      meta:        `${daysStr} · depth ${ix.depth}/5 · intent ${ix.intent}/100${ix.notes && ix.notes !== "Initial outreach (imported from CRM)" ? ` · "${ix.notes.slice(0, 80)}"` : ""}`,
      contactId:   ix.contact_id,
      contactName: contact.name,
      type:        "outreach",
      ts:          ix.date,
    });
  }

  // 5. Re-engage prompts — contacts last touched > 60 days, still warm
  const stale = (contacts ?? [])
    .filter(c => c.last_touch && daysAgo(c.last_touch) > 60 && c.signal_stack >= 40)
    .slice(0, 6);
  for (const c of stale) {
    const days = daysAgo(c.last_touch!);
    events.push({
      id:          `reeng-${c.id}`,
      icon:        "🔔",
      html:        `<strong>${c.name}</strong> (${c.company}) — re-engage window`,
      meta:        `${days}d since last touch · score ${c.signal_stack} · still warm enough to revive`,
      contactId:   c.id,
      contactName: c.name,
      type:        "re-engage",
      ts:          c.last_touch ?? "",
    });
  }

  // Sort priority: signal-alert → pressure → burnout → outreach → re-engage
  const priority: Record<string, number> = {
    "signal-alert": 0,
    "pressure":     1,
    "burnout":      2,
    "outreach":     3,
    "re-engage":    4,
    "score-update": 5,
  };

  events.sort((a, b) => {
    const pa = priority[a.type] ?? 9;
    const pb = priority[b.type] ?? 9;
    if (pa !== pb) return pa - pb;
    return b.ts.localeCompare(a.ts);
  });

  return NextResponse.json({ events: events.slice(0, 50) });
}
