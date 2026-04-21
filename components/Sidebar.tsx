"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthGate";

const sections = [
  {
    label: "Revenue",
    items: [
      { href: "/",          label: "Command Center" },
      { href: "/prospects", label: "Prospects" },
      { href: "/sequences", label: "Sequences" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/signals", label: "Signal Feed" },
      { href: "/nss",     label: "NSS Monitor" },
    ],
  },
  {
    label: "Help",
    items: [
      { href: "/guide", label: "How to Use" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  const { user, logout } = useAuth();
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggleTheme() {
    const isLight = document.documentElement.classList.toggle("light");
    setLight(isLight);
    try { localStorage.setItem("siq-theme", isLight ? "light" : "dark"); } catch {}
  }

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <div className="logo">
          <div className="logo-mark" />
          <div className="logo-text">SignalIQ <span>v2</span></div>
        </div>

        {sections.map(section => (
          <div className="nav-section" key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(item => (
              <Link key={item.href} href={item.href}
                className={`nav-item ${isActive(item.href) ? "active" : ""}`}>
                <span className="nav-dot" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* User profile + logout — pinned to bottom */}
      <div style={{ marginTop: "auto" }}>
        {user && (
          <div style={{
            padding: "12px",
            marginBottom: 8,
            borderRadius: 10,
            background: "var(--bg-2)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>
              {user[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{user}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>Pivot Training</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-3)", fontSize: 16, padding: 2,
                lineHeight: 1, borderRadius: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
            >
              ⏻
            </button>
          </div>
        )}

      {/* Theme toggle */}
      <div style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "var(--text-2)",
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 15 }}>{light ? "☀️" : "🌙"}</span>
          {light ? "Light mode" : "Dark mode"}
          <span style={{
            marginLeft: "auto",
            width: 32,
            height: 18,
            borderRadius: 9,
            background: light ? "var(--accent)" : "var(--bg-3)",
            border: "1px solid var(--line-2)",
            position: "relative",
            transition: "background 0.2s",
            flexShrink: 0,
          }}>
            <span style={{
              position: "absolute",
              top: 2,
              left: light ? 14 : 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: light ? "#fff" : "var(--text-3)",
              transition: "left 0.2s",
            }} />
          </span>
        </button>
      </div>
      </div>
    </aside>
  );
}
