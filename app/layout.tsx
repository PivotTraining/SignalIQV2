import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "SignalIQ v2 — Intelligent Revenue Layer",
  description: "Sales intelligence that reads buyer nervous system state and adapts in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sync theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('siq-theme') === 'light')
              document.documentElement.classList.add('light');
          } catch(e) {}
        `}} />
      </head>
      <body>
        <AuthGate>
          <div className="app">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}
