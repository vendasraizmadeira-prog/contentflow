"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdminClient } from "@/components/AdminClientContext";

type Client = {
  id: string;
  name: string;
  instagram: string;
  avatar: string;
  followers: number;
  growth: number;
  unreadCount: number;
  lastActivity: string;
};

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", instagram: "", email: "", password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const { setSelectedClientId } = useAdminClient();
  const router = useRouter();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, name, instagram, avatar, followers, growth, warmth_score")
      .eq("role", "client")
      .order("name");

    setClients(
      (data ?? []).map((p) => ({
        id: p.id,
        name: p.name ?? "—",
        instagram: p.instagram ?? "",
        avatar: p.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name ?? "C")}`,
        followers: p.followers ?? 0,
        growth: p.growth ?? 0,
        unreadCount: 0,
        lastActivity: "",
      }))
    );
    setLoading(false);
  };

  const create = async () => {
    if (!form.name.trim()) { setFormError("Nome obrigatório"); return; }
    if (!form.email.trim()) { setFormError("Email obrigatório"); return; }
    if (form.password.length < 6) { setFormError("Senha deve ter no mínimo 6 caracteres"); return; }
    if (form.password !== form.confirmPassword) { setFormError("As senhas não coincidem"); return; }

    setCreating(true);
    setFormError("");

    const res = await fetch("/api/admin/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, instagram: form.instagram, email: form.email, password: form.password }),
    });

    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error ?? "Erro ao criar conta.");
      setCreating(false);
      return;
    }

    setForm({ name: "", instagram: "", email: "", password: "", confirmPassword: "" });
    setFormError("");
    setShowNew(false);
    setCreating(false);
    setSelectedClientId(json.id);
    router.push(`/admin/clientes/${json.id}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{clients.length} contas ativas</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#7B4DFF", color: "#fff" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Nova conta
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: "#1A1A22", border: "1px solid #2A2A38", height: 80 }} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👥</p>
          <p className="font-semibold mb-1">Nenhum cliente cadastrado</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>Clique em "Nova conta" para adicionar o primeiro cliente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => <ClientCard key={c.id} client={c} onSelect={() => setSelectedClientId(c.id)} />)}
        </div>
      )}

      {/* New client modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background: "#2A2A38" }} />
            <h3 className="font-bold text-lg mb-0.5">Nova Conta</h3>
            <p className="text-xs mb-5" style={{ color: "#6B7280" }}>
              O cliente responderá o briefing ao entrar pela primeira vez.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              {[
                { key: "name", label: "Nome do cliente", placeholder: "Ex: Loja Verde", type: "text" },
                { key: "instagram", label: "Instagram", placeholder: "@handle", type: "text" },
                { key: "email", label: "Email de acesso", placeholder: "cliente@email.com", type: "email" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>{f.label.toUpperCase()}</label>
                  <input
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    type={f.type}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>SENHA DE ACESSO</label>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    type={showPass ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
                    style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                  />
                  <button onClick={() => setShowPass(!showPass)} type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                      {showPass
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>CONFIRMAR SENHA</label>
                <input
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#0B0B0F", border: `1px solid ${form.confirmPassword && form.password !== form.confirmPassword ? "#FF6B6B" : "#2A2A38"}`, color: "#fff" }}
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ background: "#FF6B6B22", color: "#FF6B6B" }}>{formError}</p>
            )}

            <div className="rounded-xl px-4 py-3 mb-5" style={{ background: "rgba(123,77,255,0.08)", border: "1px solid #7B4DFF33" }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#7B4DFF" }}>Briefing no primeiro acesso</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>O cliente responderá o diagnóstico ao entrar pela primeira vez. A conta será liberada após a conclusão.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowNew(false); setFormError(""); }}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{ border: "1px solid #2A2A38", color: "#9CA3AF" }}
              >
                Cancelar
              </button>
              <button
                onClick={create}
                disabled={creating}
                className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                style={{ background: "#7B4DFF", color: "#fff" }}
              >
                {creating ? "Criando..." : "Criar conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onSelect }: { client: Client; onSelect: () => void }) {
  return (
    <Link href={`/admin/clientes/${client.id}`} onClick={onSelect}>
      <div
        className="rounded-2xl p-4 transition-all active:scale-[0.99]"
        style={{ background: "#1A1A22", border: `1px solid ${client.unreadCount > 0 ? "#7B4DFF44" : "#2A2A38"}` }}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {client.avatar.startsWith("https://api.dicebear") ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF" }}>
                {client.name.charAt(0)}
              </div>
            ) : (
              <img src={client.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            )}
            {client.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#7B4DFF", color: "#fff", fontSize: 10 }}>
                {client.unreadCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{client.instagram || "—"}</p>
              </div>
              {client.followers > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{(client.followers / 1000).toFixed(1)}K</p>
                  <p className="text-xs" style={{ color: "#22C55E" }}>+{client.growth}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
