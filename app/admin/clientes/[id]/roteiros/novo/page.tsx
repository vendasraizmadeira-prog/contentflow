"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const types = [
  { key: "post",     label: "Post",      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "carousel", label: "Carrossel", icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
  { key: "reel",     label: "Reels",     icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { key: "story",    label: "Stories",   icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

export default function NovoRoteiro() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [selectedType, setSelectedType] = useState("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    createClient().from("profiles").select("name").eq("id", id).single()
      .then(({ data }) => setClientName(data?.name ?? ""));
  }, [id]);

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
    const { error } = await supabase.from("roteiros").insert({
      client_id: id,
      title: title.trim(),
      type: selectedType,
      status: sendNow ? "enviado" : "rascunho",
      content: content.trim(),
      history: [{
        id: `h${Date.now()}`,
        timestamp: now,
        action: "criado",
        note: sendNow ? "Roteiro criado e enviado para revisão." : "Roteiro criado como rascunho.",
        author: "ContentFlow",
      }],
    });
    setSaving(false);
    if (!error) router.push(`/admin/clientes/${id}/roteiros`);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-5 w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="text-sm" style={{ color: "#6B7280" }}>Roteiros — {clientName}</span>
      </button>

      <h1 className="text-xl font-bold mb-5">Novo Roteiro</h1>

      <div className="rounded-2xl p-5 mb-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>TIPO DE CONTEÚDO</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className="py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all active:scale-[0.96]"
              style={{
                background: selectedType === t.key ? "rgba(123,77,255,0.15)" : "#0B0B0F",
                border: `1px solid ${selectedType === t.key ? "#7B4DFF" : "#2A2A38"}`,
                color: selectedType === t.key ? "#7B4DFF" : "#6B7280",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold mb-2" style={{ color: "#9CA3AF" }}>TÍTULO DO ROTEIRO</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Lançamento Nova Linha"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
          style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
        />

        <p className="text-xs font-semibold mb-2" style={{ color: "#9CA3AF" }}>TEXTO DO ROTEIRO</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva o roteiro completo aqui. Para carrosseis, indique os slides. Para reels, indique timestamps..."
          rows={12}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4"
          style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
        />

        <button
          onClick={() => setSendNow(!sendNow)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all"
          style={{ background: sendNow ? "rgba(123,77,255,0.12)" : "#0B0B0F", border: `1px solid ${sendNow ? "#7B4DFF" : "#2A2A38"}` }}
        >
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: sendNow ? "#7B4DFF" : "#2A2A38" }}>
            {sendNow && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Enviar para revisão imediatamente</p>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>O cliente será notificado ao salvar</p>
          </div>
        </button>
      </div>

      <button
        onClick={submit}
        disabled={!title.trim() || !content.trim() || saving}
        className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-40"
        style={{ background: "#7B4DFF", color: "#fff" }}
      >
        {saving ? "Salvando..." : sendNow ? "Salvar e enviar para revisão" : "Salvar como rascunho"}
      </button>
    </div>
  );
}
