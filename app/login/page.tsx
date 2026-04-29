"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portal = searchParams.get("portal") || "client";
  const isAdmin = portal === "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Email ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role, briefing_completed").eq("id", data.user.id).single();

    if (profile?.role === "admin") {
      router.push("/admin/dashboard");
    } else if (profile?.briefing_completed === false) {
      router.push("/briefing");
    } else {
      router.push("/dashboard");
    }
  };

  const accent = isAdmin ? "#7B4DFF" : "#D4FF3F";
  const accentText = isAdmin ? "#fff" : "#0B0B0F";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: "#0B0B0F" }}
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: isAdmin
            ? "radial-gradient(circle, rgba(123,77,255,0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(212,255,63,0.09) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: `${accent}15`,
              border: `1.5px solid ${accent}30`,
              boxShadow: `0 0 32px ${accent}15`,
            }}
          >
            {isAdmin ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill={accent}/>
                <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Admin" : "Bem-vindo de volta"}
          </h1>
          <p className="text-sm mt-1.5 text-center" style={{ color: "#6B7280" }}>
            {isAdmin ? "Acesse o painel de controle" : "Faça login para acessar seu portal"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: "#9CA3AF", letterSpacing: "0.05em" }}>
              EMAIL
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm transition-all"
              style={{
                background: "#131318",
                border: "1.5px solid #22223A",
                color: "#fff",
                fontSize: 15,
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = `${accent}60`; e.target.style.boxShadow = `0 0 0 3px ${accent}12`; }}
              onBlur={(e) => { e.target.style.borderColor = "#22223A"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: "#9CA3AF", letterSpacing: "0.05em" }}>
              SENHA
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl text-sm pr-12 transition-all"
                style={{
                  background: "#131318",
                  border: "1.5px solid #22223A",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = `${accent}60`; e.target.style.boxShadow = `0 0 0 3px ${accent}12`; }}
                onBlur={(e) => { e.target.style.borderColor = "#22223A"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150"
                style={{ color: "#4B5563" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4B5563"; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {showPass ? (
                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  ) : (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-150 mt-2 cursor-pointer disabled:opacity-50"
            style={{
              background: loading ? `${accent}90` : accent,
              color: accentText,
              boxShadow: loading ? "none" : `0 4px 20px ${accent}30`,
              transform: loading ? "scale(0.99)" : "scale(1)",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "scale(1.01)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Entrando...
              </span>
            ) : (
              isAdmin ? "Acessar painel" : "Entrar"
            )}
          </button>
        </form>

        {!isAdmin && (
          <p className="text-center text-sm mt-8" style={{ color: "#4B5563" }}>
            Sem acesso?{" "}
            <span className="font-semibold cursor-pointer transition-colors duration-150" style={{ color: "#D4FF3F" }}>
              Fale com sua agência
            </span>
          </p>
        )}

        {!isAdmin && (
          <div className="mt-8 text-center">
            <Link href="/login?portal=admin">
              <span className="text-xs cursor-pointer transition-colors duration-150" style={{ color: "#374151" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#374151"; }}
              >
                Acesso admin →
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
