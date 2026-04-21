"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onClose:  () => void;
  onSaved:  (msg: string) => void;
}

const INDUSTRIES = [
  "Education",
  "Education Service Center",
  "Non-profit",
  "Corporate",
  "Government",
  "Healthcare",
  "Higher Education",
  "K-12",
  "Other",
];

const FIELD: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--line-2)",
  background: "var(--bg-2)",
  color: "var(--text-0)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const LABEL: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  fontWeight: 600,
  display: "block",
  marginBottom: 5,
};

export default function AddContactModal({ onClose, onSaved }: Props) {
  const firstRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState({
    name:      "",
    title:     "",
    company:   "",
    email:     "",
    phone:     "",
    industry:  "",
    headcount: "",
    next_move: "",
  });

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required."); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/contacts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       form.name.trim(),
          title:      form.title.trim()     || undefined,
          company:    form.company.trim()   || undefined,
          email:      form.email.trim()     || undefined,
          phone:      form.phone.trim()     || undefined,
          industry:   form.industry         || undefined,
          headcount:  form.headcount ? Number(form.headcount) : undefined,
          next_move:  form.next_move.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Failed to save contact.");
        setSaving(false);
        return;
      }

      onSaved(`✓ ${form.name.trim()} added`);
      onClose();
    } catch {
      setError("Network error — please try again.");
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--bg-1)", borderRadius: 18,
        border: "1px solid var(--line-2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        display: "flex", flexDirection: "column",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-2)", borderRadius: "18px 18px 0 0",
          position: "sticky", top: 0, zIndex: 2,
        }}>
          <span style={{ fontSize: 22 }}>👤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-0)" }}>Add contact</div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>New contact goes straight to Supabase</div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", width: 30, height: 30, borderRadius: "50%",
              border: "none", background: "var(--bg-3)", color: "var(--text-2)",
              fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Name — required */}
          <div>
            <label style={LABEL}>Name <span style={{ color: "var(--accent)" }}>*</span></label>
            <input
              ref={firstRef}
              style={{ ...FIELD, borderColor: error && !form.name.trim() ? "var(--danger, #ef4444)" : "var(--line-2)" }}
              placeholder="Full name"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Title + Company side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL}>Title</label>
              <input style={FIELD} placeholder="e.g. Principal" value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>Company / School</label>
              <input style={FIELD} placeholder="Organization name" value={form.company} onChange={e => set("company", e.target.value)} />
            </div>
          </div>

          {/* Email + Phone side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL}>Email</label>
              <input
                style={FIELD}
                type="email"
                placeholder="name@school.org"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
            </div>
            <div>
              <label style={LABEL}>Phone</label>
              <input
                style={FIELD}
                type="tel"
                placeholder="555-000-0000"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Industry + Headcount side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={LABEL}>Industry</label>
              <select
                style={{ ...FIELD, cursor: "pointer" }}
                value={form.industry}
                onChange={e => set("industry", e.target.value)}
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Headcount</label>
              <input
                style={FIELD}
                type="number"
                placeholder="e.g. 120"
                min={1}
                value={form.headcount}
                onChange={e => set("headcount", e.target.value)}
              />
            </div>
          </div>

          {/* Next move */}
          <div>
            <label style={LABEL}>Notes / Next move</label>
            <textarea
              style={{ ...FIELD, resize: "vertical", minHeight: 72, fontFamily: "inherit", lineHeight: 1.5 }}
              placeholder="What's the context? What's the play?"
              value={form.next_move}
              onChange={e => set("next_move", e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize: 12, color: "var(--danger, #ef4444)", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "11px 0", fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Add contact"}
            </button>
            <button
              className="btn"
              style={{ padding: "11px 20px" }}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center" }}>
            Scores default to 50 and recalibrate on the next signal sweep.
          </div>
        </div>
      </div>
    </div>
  );
}
