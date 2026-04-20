"use client";
import { useState } from "react";

type Props = { contactId: string; onLogged?: () => void };

export default function LogInteraction({ contactId, onLogged }: Props) {
  const [open, setOpen]     = useState(false);
  const [channel, setChannel] = useState("email");
  const [direction, setDir]   = useState<"in" | "out">("out");
  const [body, setBody]       = useState("");
  const [depth, setDepth]     = useState(3);
  const [intent, setIntent]   = useState(50);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setSaving(true);
    await fetch("/api/interactions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ contactId, channel, direction, body, depth, intent }),
    });
    setSaving(false);
    setSaved(true);
    setBody("");
    setTimeout(() => { setSaved(false); setOpen(false); onLogged?.(); }, 1200);
  }

  if (!open) {
    return (
      <button className="micro-btn" onClick={() => setOpen(true)}
        style={{ margin: "16px 20px", display: "block" }}>
        + Log Interaction
      </button>
    );
  }

  return (
    <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)", background: "var(--bg-2)" }}>
      <div style={{ fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        Log Interaction
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 }}>Channel</label>
          <select value={channel} onChange={e => setChannel(e.target.value)}
            style={{ width: "100%", padding: "6px 8px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--text-0)", fontSize: 13 }}>
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 }}>Direction</label>
          <select value={direction} onChange={e => setDir(e.target.value as "in" | "out")}
            style={{ width: "100%", padding: "6px 8px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--text-0)", fontSize: 13 }}>
            <option value="out">Sent (outbound)</option>
            <option value="in">Reply (inbound)</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 }}>Depth 1–5</label>
          <input type="number" min={1} max={5} value={depth} onChange={e => setDepth(Number(e.target.value))}
            style={{ width: "100%", padding: "6px 8px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--text-0)", fontSize: 13 }} />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 }}>
          Intent Signal (0–100) — {intent} <span style={{ color: "var(--text-3)" }}>0=discovery · 50=interested · 100=ready to buy</span>
        </label>
        <input type="range" min={0} max={100} step={5} value={intent} onChange={e => setIntent(Number(e.target.value))}
          style={{ width: "100%" }} />
      </div>
      <textarea className="msg-edit" placeholder="What was said, key signals, next move…"
        value={body} onChange={e => setBody(e.target.value)} style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn btn-primary" onClick={submit} disabled={saving || !body.trim()}>
          {saving ? "Saving…" : "Save interaction"}
        </button>
        <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
        {saved && <span style={{ color: "var(--ventral)", fontSize: 12 }}>✓ Logged — Signal Score updating</span>}
      </div>
    </div>
  );
}
