"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HistoryEntry = { id: string; timestamp: string; action: "criado" | "editado" | "aprovado"; note: string; author: string; };
type Roteiro = { id: string; title: string; type: string; status: string; content: string; created_at: string; history: HistoryEntry[]; };

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

function nowStr() {
  return new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
}

const actionIcon = (action: string) => {
  if (action === "criado") return { color: "#6B7280", icon: "M12 4v16m8-8H4" };
  if (action === "editado") return { color: "#D4FF3F", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" };
  return { color: "#10B981", icon: "M5 13l4 4L19 7" };
};

export default function RoteiroDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [content, setContent] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: r }, { data: prof }] = await Promise.all([
        supabase.from("roteiros").select("*").eq("id", id).eq("client_id", user.id).single(),
        supabase.from("profiles").select("name").eq("id", user.id).single(),
      ]);

      if (r) {
        setRoteiro(r);
        setContent(r.content ?? "");
        setHistory(r.history ?? []);
      }
      setUserName(prof?.name ?? "Cliente");
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!roteiro || !content.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();
    const entry: HistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: nowStr(),
      action: "editado",
      note: "Conteúdo editado pelo cliente.",
      author: userName,
    };
    const newHistory = [...history, entry];
    const { error } = await supabase.from("roteiros").update({ content, history: newHistory }).eq("id", roteiro.id);
    if (!error) {
      setHistory(newHistory);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleApprove = async () => {
    if (!roteiro || roteiro.status === "aprovado" || saving) return;
    setSaving(true);
    const supabase = createClient();
    const entry: HistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: nowStr(),
      action: "aprovado",
      note: "Roteiro aprovado pelo cliente.",
      author: userName,
    };
    const newHistory = [...history, entry];
    const { error } = await supabase.from("roteiros").update({ status: "aprovado", history: newHistory }).eq("id", roteiro.id);
    if (!error) {
      setRoteiro({ ...roteiro, status: "aprovado" });
      setHistory(newHistory);
      // Notify admin
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: "admin", title: `Roteiro aprovado por ${userName}`, message: roteiro.title, type: "approved", url: `/admin/clientes/${userId}/roteiros/${roteiro.id}` }),
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#D4FF3F", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!roteiro) {
    return (
      <div className="p-6 text-center" style={{ color: "#6B7280" }}>
        <p className="text-lg font-semibold mb-2">Roteiro não encontrado</p>
        <button onClick={() => router.back()} className="text-sm" style={{ color: "#D4FF3F" }}>Voltar</button>
      </div>
    );
  }

  const color = typeColor[roteiro.type] ?? "#7B4DFF";
  const isApproved = roteiro.status === "aprovado";

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>{typeLabel[roteiro.type] ?? roteiro.type}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: isApproved ? "#10B98122" : "#F59E0B22", color: isApproved ? "#10B981" : "#F59E0B" }}>
              {isApproved ? "Aprovado" : "Pendente"}
            </span>
          </div>
          <h1 className="font-bold text-base truncate">{roteiro.title}</h1>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>TEXTO DO ROTEIRO</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full text-sm leading-relaxed resize-none outline-none"
          style={{ background: "transparent", color: "#E5E7EB", caretColor: "#D4FF3F" }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mb-3 transition-all active:scale-[0.97] disabled:opacity-60"
        style={{ background: saved ? "#10B981" : "#0F0F1E", color: saved ? "#fff" : "#D4FF3F", border: `1px solid ${saved ? "#10B981" : "#D4FF3F"}` }}
      >
        {saving ? "Salvando..." : saved ? "✓ Alterações salvas" : "Salvar alterações"}
      </button>

      {!isApproved ? (
        <button onClick={handleApprove} disabled={saving} className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-60" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
          Aprovar roteiro
        </button>
      ) : (
        <div className="w-full py-3.5 rounded-2xl font-bold text-sm text-center" style={{ background: "#10B98122", color: "#10B981", border: "1px solid #10B981" }}>
          ✓ Roteiro aprovado
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs font-semibold mb-4" style={{ color: "#9CA3AF" }}>HISTÓRICO DE ALTERAÇÕES</p>
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "#22223A" }} />
          <div className="flex flex-col gap-0">
            {history.map((entry) => {
              const { color: dotColor, icon } = actionIcon(entry.action);
              return (
                <div key={entry.id} className="flex gap-4 pb-5 relative">
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${dotColor}22`, border: `1.5px solid ${dotColor}` }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={dotColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold" style={{ color: dotColor }}>
                        {entry.action === "criado" ? "Criado" : entry.action === "editado" ? "Editado" : "Aprovado"}
                      </span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>por {entry.author}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-1" style={{ color: "#9CA3AF" }}>{entry.note}</p>
                    <span className="text-xs" style={{ color: "#4B5563" }}>{entry.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
