import type { FeedEvent, Prospect } from "./types";
import { inferState } from "./nss";
import { rScore } from "./rscore";

const raw: Omit<Prospect, "state" | "stateConfidence">[] = [
  {
    id: "marcus-reyes",
    name: "Marcus Reyes",
    title: "VP Growth",
    company: "Nimbus Labs",
    headcount: 42,
    initials: "MR",
    industry: "DevTools SaaS",
    stack: ["Apollo", "Instantly", "HubSpot"],
    signalStack: 92, intentVelocity: 85, budgetIndicator: 78,
    authorityMatch: 88, timingWindow: 90, socialProofAlignment: 80,
    nextMove: "Pattern interrupt. Do not pitch. Two-sentence curiosity hook.",
    signals: [
      { label: "Hiring signal", value: "3 SDR reqs opened this week" },
      { label: "Stack shift", value: "Dropped Apollo, trialing Clay" },
      { label: "Content velocity", value: "4 LinkedIn posts, 3 about pipeline pain" },
      { label: "Funding", value: "$6M Series A closed 38 days ago" },
    ],
    interactions: [
      { id: "m1", channel: "email", direction: "out", at: "2026-04-10", body: "Marcus — quick note on the SDR stack shift. Two observations when you're ready." },
      { id: "m2", channel: "email", direction: "in", at: "2026-04-10", latencyHours: 2, body: "Why would I need another tool? We already have Apollo. Prove it." },
      { id: "m3", channel: "email", direction: "out", at: "2026-04-12", body: "Fair question. Not a pitch — a 30-second read on why three of your peers dropped Apollo this quarter." },
    ],
    lastTouchDaysAgo: 1,
  },
  {
    id: "keira-thompson",
    name: "Keira Thompson",
    title: "Founder",
    company: "Braid AI",
    headcount: 8,
    initials: "KT",
    industry: "AI Infrastructure",
    stack: ["Linear", "Vercel", "Resend"],
    signalStack: 95, intentVelocity: 90, budgetIndicator: 82,
    authorityMatch: 98, timingWindow: 95, socialProofAlignment: 85,
    nextMove: "Meeting ask. She's ready. Confirm Thursday 2pm.",
    signals: [
      { label: "Intent signal", value: "Visited pricing page 4x in 5 days" },
      { label: "Reply cadence", value: "Responds within 4 hours, specific questions" },
      { label: "Peer proof", value: "Follows 3 existing SignalIQ customers" },
      { label: "Funding", value: "YC W26 — actively hiring GTM" },
    ],
    interactions: [
      { id: "k1", channel: "email", direction: "out", at: "2026-04-08", body: "Keira — I read your post on GTM for zero-to-one AI. Two things we should talk about." },
      { id: "k2", channel: "email", direction: "in", at: "2026-04-08", latencyHours: 5, body: "Let's do it. How do we move from here? I have Thursday or Friday afternoon ET. Happy to jump on 30 min." },
    ],
    lastTouchDaysAgo: 0,
  },
  {
    id: "jordan-walsh",
    name: "Jordan Walsh",
    title: "CTO",
    company: "Ledgerpoint",
    headcount: 16,
    initials: "JW",
    industry: "Fintech",
    stack: ["Postgres", "Retool", "Intercom"],
    signalStack: 60, intentVelocity: 45, budgetIndicator: 70,
    authorityMatch: 72, timingWindow: 55, socialProofAlignment: 65,
    nextMove: "Permission-to-reconnect message. No ask. 5-day silence.",
    signals: [
      { label: "Silence", value: "No reply in 9 days" },
      { label: "Last touch", value: "Opened email, no click, no reply" },
      { label: "Calendar", value: "Cancelled last call without reschedule" },
    ],
    interactions: [
      { id: "j1", channel: "email", direction: "out", at: "2026-04-01", body: "Jordan — curious how the migration from Intercom is going. Happy to share two notes." },
      { id: "j2", channel: "email", direction: "in", at: "2026-04-02", latencyHours: 22, body: "ok" },
      { id: "j3", channel: "email", direction: "out", at: "2026-04-08", body: "Following up." },
    ],
    lastTouchDaysAgo: 9,
  },
  {
    id: "ana-okafor",
    name: "Ana Okafor",
    title: "Head of RevOps",
    company: "Stanza",
    headcount: 58,
    initials: "AO",
    industry: "Vertical SaaS",
    stack: ["Salesforce", "Outreach", "Gong"],
    signalStack: 78, intentVelocity: 72, budgetIndicator: 85,
    authorityMatch: 85, timingWindow: 70, socialProofAlignment: 75,
    nextMove: "Direct value ask. She's engaged. Send pricing one-pager.",
    signals: [
      { label: "Intent", value: "Forwarded last email to CRO" },
      { label: "Hiring", value: "2 RevOps analyst reqs open" },
      { label: "Engagement", value: "Clicked 3 of last 4 emails" },
    ],
    interactions: [
      { id: "a1", channel: "email", direction: "out", at: "2026-04-11", body: "Ana — the RevOps req tells me where you're pointing. Want the three-week rollout plan?" },
      { id: "a2", channel: "email", direction: "in", at: "2026-04-12", latencyHours: 26, body: "Yes please. Let's set up a time next week — how do we move forward on pricing?" },
    ],
    lastTouchDaysAgo: 2,
  },
  {
    id: "diego-ramos",
    name: "Diego Ramos",
    title: "Founder",
    company: "Pulsecart",
    headcount: 4,
    initials: "DR",
    industry: "E-commerce Tools",
    stack: ["Shopify", "Klaviyo", "Notion"],
    signalStack: 55, intentVelocity: 60, budgetIndicator: 35,
    authorityMatch: 95, timingWindow: 40, socialProofAlignment: 50,
    nextMove: "Nurture. Below budget threshold — quarterly touch only.",
    signals: [
      { label: "Revenue", value: "~$3K MRR (below ICP mid-band)" },
      { label: "Engagement", value: "Opens every email, never clicks pricing" },
    ],
    interactions: [
      { id: "d1", channel: "email", direction: "out", at: "2026-04-03", body: "Diego — sharing a note on indie GTM when you're past the $10K line." },
      { id: "d2", channel: "email", direction: "in", at: "2026-04-04", latencyHours: 18, body: "Thanks, appreciate you thinking of me. Maybe later when we hit the next milestone." },
    ],
    lastTouchDaysAgo: 13,
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    title: "COO",
    company: "Vantage Loop",
    headcount: 34,
    initials: "PS",
    industry: "Ops & Analytics",
    stack: ["Snowflake", "Hex", "Attio"],
    signalStack: 70, intentVelocity: 55, budgetIndicator: 78,
    authorityMatch: 82, timingWindow: 62, socialProofAlignment: 70,
    nextMove: "Pattern interrupt. Activated by deadline pressure.",
    signals: [
      { label: "Board pressure", value: "Mentioned board review on LinkedIn" },
      { label: "Reply tone", value: "Clipped, ASAP-heavy language" },
    ],
    interactions: [
      { id: "p1", channel: "email", direction: "out", at: "2026-04-09", body: "Priya — board-ready pipeline view in 14 days. Interested?" },
      { id: "p2", channel: "email", direction: "in", at: "2026-04-09", latencyHours: 1, body: "Send ASAP. No time. What's the price!!" },
    ],
    lastTouchDaysAgo: 2,
  },
];

export const prospects: Prospect[] = raw.map(p => {
  const { state, confidence } = inferState(p.interactions);
  return { ...p, state, stateConfidence: confidence };
});

export function getProspect(id: string): Prospect | undefined {
  return prospects.find(p => p.id === id);
}

export function getRScore(p: Prospect) { return rScore(p); }

export function kpis() {
  const pipe = prospects.reduce((sum, p) => sum + Math.round(p.signalStack * 1800 + p.budgetIndicator * 300), 0);
  const ventralPct = Math.round(
    100 * prospects.filter(p => p.state === "ventral").length / prospects.length
  );
  const avgR = Math.round(
    10 * prospects.reduce((s, p) => s + rScore(p), 0) / prospects.length
  ) / 10;
  return {
    pipeline: pipe,
    ventralPct,
    meetingsBooked: 17,
    avgR,
  };
}

export const feed: FeedEvent[] = [
  { id: "f1", icon: "🎯", html: "<strong>Keira Thompson</strong> flipped to <strong>ventral vagal</strong>. Reply latency 5h, booking language present.", meta: "2 min ago · Braid AI", prospectId: "keira-thompson" },
  { id: "f2", icon: "📈", html: "<strong>Nimbus Labs</strong> opened 3 new SDR reqs — R-Score jumped 11 points.", meta: "18 min ago · Signal harvest", prospectId: "marcus-reyes" },
  { id: "f3", icon: "⚠️", html: "<strong>Jordan Walsh</strong> dorsal-state confidence rose to 0.71. Suggest permission-to-reconnect.", meta: "1 hr ago · Ledgerpoint", prospectId: "jordan-walsh" },
  { id: "f4", icon: "💬", html: "<strong>Ana Okafor</strong> forwarded last email internally. CRO is in the thread.", meta: "3 hr ago · Stanza", prospectId: "ana-okafor" },
  { id: "f5", icon: "🧠", html: "NSS model retrained on 47 new labeled interactions. Accuracy +1.8pts.", meta: "6 hr ago · System" },
  { id: "f6", icon: "🚨", html: "<strong>Priya Shah</strong> sympathetic activation detected. Do not send pricing.", meta: "8 hr ago · Vantage Loop", prospectId: "priya-shah" },
];
