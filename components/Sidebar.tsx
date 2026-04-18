"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Revenue",
    items: [
      { href: "/", label: "Command Center" },
      { href: "/prospects", label: "Prospects" },
      { href: "/sequences", label: "Sequences" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/signals", label: "Signal Feed" },
      { href: "/nss", label: "NSS Monitor" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <aside className="sidebar">
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
    </aside>
  );
}
