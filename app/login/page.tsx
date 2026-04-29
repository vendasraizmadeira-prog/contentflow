"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

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
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Fetch role to decide where to redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, briefing_completed")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      router.push("/admin/dashboard");
    } else if (profile?.briefing_completed === false) {
      router.push("/briefing");
    } else {
      router.push("/metricas");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{
        background: "radial-gradient(ellipse at 50% 110%, rgba(212,255,63,0.08) 0%, #0B0B0F 60%)",
      }}
    >
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(212,255,63,0.08)", border: "1px solid rgba(212,255,63,0.2)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="#D4FF3F" />
            <path
              d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"
              stroke="#D4FF3F"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Faça login para continuar
        </p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
              style={{ background: "#1A1A22", border: "1px solid #2A2A38", color: "#fff", fontSize: 15 }}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Senha</label>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none pr-12"
                style={{ background: "#1A1A22", border: "1px solid #2A2A38", color: "#fff", fontSize: 15 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "#6B7280" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#FF6B6B22", color: "#FF6B6B" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.97] mt-1 disabled:opacity-60"
            style={{
              background: isAdmin ? "#7B4DFF" : "#D4FF3F",
              color: isAdmin ? "#fff" : "#0B0B0F",
              fontSize: 15,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {!isAdmin && (
          <p className="text-center text-sm mt-6" style={{ color: "#6B7280" }}>
            Não tem conta?{" "}
            <span style={{ color: "#D4FF3F" }} className="cursor-pointer font-medium">
              Fale com sua agência
            </span>
          </p>
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
