"use client";
import { useRef, useState } from "react";
import type { Prospect, ProspectPriority } from "@/lib/types";

interface Props {
  p:            Prospect;
  onOpen:       (p: Prospect) => void;
  isFavorited?: boolean;
  onFavorite?:  (id: string) => void;
  onChanged?:   () => void;
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  high: { bg: "rgba(239,68,68,0.10)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  mid:  { bg: "rgba(234,179,8,0.10)",   color: "#ca8a04", border: "rgba(234,179,8,0.25)" },
  low:  { bg: "rgba(100,116,139,0.10)", color: "#64748b", border: "rgba(100,116,139,0.25)" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProspectRow({ p, onOpen, isFavorited, onFavorite, onChanged }: Props) {
  const [priority, setPriority]           = useState<ProspectPriority>(p.priority ?? null);
  const [lastContacted, setLastContacted] = useState<string | null>(p.lastContacted ?? null);
  const [editingDate, setEditingDate]     = useState(false);
  const [notes, setNotes]                 = useState(p.nextMove ?? "");
  const [editingNotes, setEditingNotes]   = useState(false);
  const [notesSaved, setNotesSaved]       = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesRef   = useRef<HTMLTextAreaElement>(null);

  const priKey   = priority ?? "none";
  const priStyle = PRIORITY_STYLES[priKey as keyof typeof PRIORITY_STYLES] ?? { bg: "rgba(148,163,184,0.06)", color: "#94a3b8", border: "rgba(148,163,184,0.15)" };

  async function savePriority(next: ProspectPriority) {
    setPriority(next);
    try {
      await fetch(`/api/contacts/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: next }),
      });
      onChanged?.();
    } catch { /* optimistic */ }
  }

  async function saveLastContacted(next: string | null) {
    setLastContacted(next);
    setEditingDate(false);
    try {
      await fetch(`/api/contacts/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContacted: next }),
      });
      onChanged?.();
    } catch { /* optimistic */ }
  }

  function handleNotesChange(val: string) {
    setNotes(val);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/contacts/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nextMove: val.trim() || null }),
        });
        setNotesSaved(true);
        onChanged?.();
        setTimeout(() => setNotesSaved(false), 2000);
      } catch { /* optimistic */ }
    }, 800);
  }

  function openNotes(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingNotes(true);
    setTimeout(() => notesRef.current?.focus(), 0);
  }

  function closeNotes(e: React.FocusEvent) {
    // Only close if focus left the notes area entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setEditingNotes(false);
    }
  }

  return (
    <div
      className="prospect-row"
      style={{ display: "grid", cursor: "default" }}
    >
      {/* Contact column — star + avatar + clickable name */}
      <div className="person">
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(p.id); }}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 15, padding: "0 4px 0 0", flexShrink: 0,
            color: isFavorited ? "#f59e0b" : "var(--text-3)",
            opacity: isFavorited ? 1 : 0.35,
            transition: "opacity 0.15s, color 0.15s",
            lineHeight: 1,
          }}
        >
          {isFavorited ? "★" : "☆"}
        </button>
        <div className="avatar">{p.initials}</div>
        <div>
          <button
            onClick={() => onOpen(p)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 0, textAlign: "left",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: 13.5,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {p.name}
          </button>
          <div className="person-sub">{p.title} · {p.company}</div>
        </div>
      </div>

      {/* Priority */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }} onClick={e => e.stopPropagation()}>
        <select
          value={priority ?? ""}
          onChange={e => {
            const v = e.target.value;
            savePriority(v === "" ? null : v as ProspectPriority);
          }}
          onClick={e => e.stopPropagation()}
          style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 22px 3px 10px",
            borderRadius: 20, fontSize: 11.5, fontWeight: 600,
            background: priStyle.bg, color: priStyle.color,
            border: `1px solid ${priStyle.border}`,
            outline: "none", cursor: "pointer",
            appearance: "none",
          }}
        >
          <option value="">— None</option>
          <option value="high">High</option>
          <option value="mid">Mid</option>
          <option value="low">Low</option>
        </select>
        <span style={{ position: "absolute", right: 7, pointerEvents: "none", fontSize: 8, color: priStyle.color }}>▼</span>
      </div>

      {/* Inline Notes */}
      <div
        onFocus={closeNotes}
        style={{ position: "relative" }}
        onClick={e => e.stopPropagation()}
      >
        {editingNotes ? (
          <div onBlur={closeNotes} tabIndex={-1} style={{ outline: "none" }}>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Escape") setEditingNotes(false);
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setEditingNotes(false); }
              }}
              rows={3}
              style={{
                width: "100%", padding: "6px 8px",
                background: "var(--bg-1)",
                border: "1px solid var(--accent)",
                borderRadius: 6,
                color: "var(--text-0)", fontSize: 12.5,
                resize: "vertical", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5,
                boxSizing: "border-box",
              }}
              placeholder="Add a note… (Enter to close)"
            />
            {notesSaved && (
              <span style={{ fontSize: 10, color: "var(--ventral, #22c55e)", display: "block", marginTop: 2 }}>Saved</span>
            )}
          </div>
        ) : (
          <div
            onClick={openNotes}
            title={notes || "Click to add a note"}
            style={{
              cursor: "text",
              fontSize: 12.5,
              color: notes ? "var(--text-1)" : "var(--text-3)",
              fontStyle: notes ? "normal" : "italic",
              lineHeight: 1.4,
              minHeight: 20,
            }}
          >
            {notes
              ? (notes.length > 80 ? notes.slice(0, 80) + "…" : notes)
              : "+ add note"}
          </div>
        )}
      </div>

      {/* Last Contacted */}
      <div onClick={e => e.stopPropagation()}>
        {editingDate ? (
          <input
            type="date"
            defaultValue={lastContacted ?? ""}
            autoFocus
            onChange={e => saveLastContacted(e.target.value || null)}
            onBlur={() => setEditingDate(false)}
            style={{
              fontSize: 11.5, padding: "3px 6px", borderRadius: 6,
              border: "1px solid var(--line-2)", background: "var(--bg-2)",
              color: "var(--text-0)", outline: "none",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingDate(true)}
            style={{
              fontSize: 11.5,
              color: lastContacted ? "var(--text-1)" : "var(--text-3)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              whiteSpace: "nowrap",
            }}
          >
            {lastContacted ? formatDate(lastContacted) : "+ Set date"}
          </button>
        )}
      </div>

      {/* Open profile button */}
      <button
        className="micro-btn"
        onClick={e => { e.stopPropagation(); onOpen(p); }}
      >
        Open
      </button>
    </div>
  );
}
