"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ── Auth context ───────────────────────────────────────────────────────────────
interface AuthCtx { user: string; logout: () => void; }
export const AuthContext = createContext<AuthCtx>({ user: "", logout: () => {} });
export const useAuth = () => useContext(AuthContext);

// ── Profiles ───────────────────────────────────────────────────────────────────
const PROFILES = ["Chris", "Jazmine"];
// Shared passcode — change NEXT_PUBLIC_SIQ_CODE in Vercel env to override
const CODE = process.env.NEXT_PUBLIC_SIQ_CODE ?? "pivot";

// ── Logo mark ─────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 16,
      background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 32px rgba(124,92,255,0.5)",
      marginBottom: 20, position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 12, borderRadius: 6,
        background: "var(--bg-0)",
      }} />
    </div>
  );
}

// ── Login screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: string) => void }) {
  const [profile, setProfile] = useState("");
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [shake, setShake]     = useState(false);

  function attempt() {
    if (!profile) { setError("Pick your profile first."); return; }
    if (code === CODE) {
      onLogin(profile);
    } else {
      setError("Wrong passcode.");
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-0)",
      padding: 20,
    }}>
      {/* Subtle glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 700px 500px at 50% 30%, rgba(124,92,255,0.10), transparent 70%)",
      }} />

      <div style={{
        width: "100%", maxWidth: 380,
        background: "var(--bg-1)", borderRadius: 20,
        border: "1px solid var(--line-2)",
        padding: "36px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        position: "relative",
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
        `}</style>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LogoMark />
          </div>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 4 }}>
            SignalIQ
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>
            Pivot Training · Revenue Intelligence
          </div>
        </div>

        {/* Profile picker */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
            Who's signing in?
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {PROFILES.map(p => (
              <button
                key={p}
                onClick={() => { setProfile(p); setError(""); }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: `2px solid ${profile === p ? "var(--accent)" : "var(--line-2)"}`,
                  background: profile === p ? "rgba(124,92,255,0.12)" : "var(--bg-2)",
                  color: profile === p ? "var(--accent)" : "var(--text-1)",
                  fontWeight: profile === p ? 700 : 500,
                  fontSize: 14, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Passcode */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
            Passcode
          </label>
          <input
            type="password"
            placeholder="Enter passcode"
            autoComplete="current-password"
            value={code}
            onChange={e => { setCode(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${error ? "var(--danger)" : "var(--line-2)"}`,
              background: "var(--bg-2)",
              color: "var(--text-0)",
              fontSize: 15,
              outline: "none",
              letterSpacing: "0.12em",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 6 }}>{error}</div>
          )}
        </div>

        {/* Sign in button */}
        <button
          onClick={attempt}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, var(--accent), #9370ff)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(124,92,255,0.4)",
            transition: "filter 0.15s",
            marginBottom: 14,
          }}
          onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={e => (e.currentTarget.style.filter = "none")}
        >
          Sign in
        </button>

        <div style={{ fontSize: 11.5, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6 }}>
          Your browser will offer to save this with Face ID or Touch ID.
          <br />Tap "Use Passkey" when prompted for one-tap access next time.
        </div>
      </div>
    </div>
  );
}

// ── Auth gate (exported default) ───────────────────────────────────────────────
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "authed" | "login">("loading");
  const [user, setUser]   = useState("");

  useEffect(() => {
    try {
      const authed = localStorage.getItem("siq-authed") === "true";
      const u      = localStorage.getItem("siq-user") ?? "";
      if (authed && u) { setUser(u); setState("authed"); }
      else               setState("login");
    } catch {
      setState("login");
    }
  }, []);

  const login = useCallback((u: string) => {
    try {
      localStorage.setItem("siq-authed", "true");
      localStorage.setItem("siq-user", u);
    } catch {}
    setUser(u);
    setState("authed");
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("siq-authed");
      localStorage.removeItem("siq-user");
    } catch {}
    setUser("");
    setState("login");
  }, []);

  if (state === "loading") return null;
  if (state === "login")   return <LoginScreen onLogin={login} />;

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
