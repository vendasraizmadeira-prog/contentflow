"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };
const statusConfig: Record<string, { label: string; color: string }> = {
  rascunho:   { label: "Rascunho",   color: "#6B7280" },
  enviado:    { label: "Enviado",    color: "#FBBF24" },
  em_revisao: { label: "Em revisão", color: "#818CF8" },
  aprovado:   { label: "Aprovado",   color: "#10B981" },
};

type HistoryEntry = { id: string; timestamp: string; action: string; note: string; author: string };

function nowTs() {
  return new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
}

export default function AdminRoteiroDetail() {
  const { id, rId } = useParams() as { id: string; rId: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("post");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [producaoId, setProducaoId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [rRes, pRes] = await Promise.all([
        supabase.from("roteiros").select("*").eq("id", rId).eq("client_id", id).single(),
        supabase.from("profiles").select("name").eq("id", id).single(),
      ]);
      if (rRes.data) {
        setTitle(rRes.data.title);
        setType(rRes.data.type);
        setContent(rRes.data.content ?? "");
        setStatus(rRes.data.status);
        setHistory(rRes.data.history ?? []);
        setProducaoId(rRes.data.producao_id ?? null);
        setCreatedAt(new Date(rRes.data.created_at).toLocaleDateString("pt-BR"));
      }
      setClientName(pRes.data?.name ?? "");
      setLoading(false);
    };
    load();
  }, [id, rId]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const entry: HistoryEntry = { id: `h${Date.now()}`, timestamp: nowTs(), action: "editado", note: "Roteiro editado pelo administrador.", author: "ContentFlow" };
    const newHistory = [...history, entry];
    await supabase.from("roteiros").update({ content, history: newHistory }).eq("id", rId);
    setHistory(newHistory);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSend = async () => {
    if (status === "aprovado") return;
    const supabase = createClient();
    const entry: HistoryEntry = { id: `h${Date.now()}`, timestamp: nowTs(), action: "editado", note: "Roteiro enviado para revisão do cliente.", author: "ContentFlow" };
    const newHistory = [...history, entry];
    await supabase.from("roteiros").update({ status: "enviado", content, history: newHistory }).eq("id", rId);
    setStatus("enviado");
    setHistory(newHistory);
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  const handleSendProducao = () => {
    router.push(`/admin/clientes/${id}/producao/novo?roteiroId=${rId}&tipo=${type}&titulo=${encodeURIComponent(title)}`);
  };

  const dotStyle = (action: string) => {
    if (action === "criado") return { color: "#6B7280", icon: "M12 4v16m8-8H4" };
    if (action === "editado") return { color: "#7B4DFF", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" };
    return { color: "#10B981", icon: "M5 13l4 4L19 7" };
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-64"><div className="text-sm" style={{ color: "#6B7280" }}>Carregando roteiro...</div></div>;
  }

  if (!title && !loading) {
    return <div className="p-6 text-center" style={{ color: "#6B7280" }}>Roteiro não encontrado.</div>;
  }

  const tc = typeColor[type] ?? "#7B4DFF";
  const st = statusConfig[status] ?? { label: status, color: "#6B7280" };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-5 w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="text-sm" style={{ color: "#6B7280" }}>Roteiros — {clientName}</span>
      </button>

      <div className="flex items-start gap-3 mb-5">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${tc}22`, color: tc }}>{typeLabel[type] ?? type}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
          </div>
          <h1 className="font-bold text-xl">{title}</h1>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Criado em {createdAt}</p>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>TEXTO DO ROTEIRO</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full text-sm leading-relaxed resize-none outline-none"
          style={{ background: "transparent", color: "#E5E7EB", caretColor: "#7B4DFF" }}
        />
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60"
          style={{
            background: saved ? "#10B981" : "#0F0F1E",
            color: saved ? "#fff" : "#7B4DFF",
            border: `1px solid ${saved ? "#10B981" : "#7B4DFF"}`,
          }}
        >
          {saving ? "Salvando..." : saved ? "✓ Alterações salvas" : "Salvar alterações"}
        </button>

        {status !== "aprovado" && (
          <button
            onClick={handleSend}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
            style={{ background: sent ? "#10B981" : "#7B4DFF", color: "#fff" }}
          >
            {sent ? "✓ Enviado para revisão" : status === "enviado" ? "Reenviar para revisão" : "Enviar para revisão do cliente"}
          </button>
        )}

        {status === "aprovado" && (
          <>
            <div className="w-full py-3.5 rounded-2xl font-semibold text-sm text-center" style={{ background: "#10B98122", color: "#10B981", border: "1px solid #10B981" }}>
              ✓ Aprovado pelo cliente
            </div>
            {!producaoId && (
              <button
                onClick={handleSendProducao}
                className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ background: "#D4FF3F", color: "#0B0B0F" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Encaminhar para produção
              </button>
            )}
            {producaoId && (
              <button
                onClick={() => router.push(`/admin/clientes/${id}/producao`)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
                style={{ background: "rgba(212,255,63,0.12)", color: "#D4FF3F", border: "1px solid #D4FF3F44" }}
              >
                Ver produção →
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-xs font-semibold mb-4" style={{ color: "#9CA3AF" }}>HISTÓRICO DE ALTERAÇÕES</p>
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "#22223A" }} />
        <div className="flex flex-col gap-0">
          {history.map((entry) => {
            const { color: dc, icon } = dotStyle(entry.action);
            return (
              <div key={entry.id} className="flex gap-4 pb-5 relative">
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${dc}22`, border: `1.5px solid ${dc}` }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: dc }}>
                      {entry.action === "criado" ? "Criado" : entry.action === "editado" ? "Editado" : "Aprovado"}
                    </span>
                    <span className="text-xs" style={{ color: "#6B7280" }}>por {entry.author}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-0.5" style={{ color: "#9CA3AF" }}>{entry.note}</p>
                  <span className="text-xs" style={{ color: "#4B5563" }}>{entry.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
