"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockRoteiros, type RoteiroHistoryEntry } from "@/lib/mock-data";

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

function now() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(",", "");
}

export default function RoteiroDetail() {
  const params = useParams();
  const router = useRouter();
  const source = mockRoteiros.find((r) => r.id === params.id);

  const [content, setContent] = useState(source?.content ?? "");
  const [status, setStatus] = useState(source?.status ?? "pendente");
  const [history, setHistory] = useState<RoteiroHistoryEntry[]>(source?.history ?? []);
  const [saved, setSaved] = useState(false);
  const [approved, setApproved] = useState(false);

  if (!source) {
    return (
      <div className="p-6 text-center" style={{ color: "#6B7280" }}>
        <p>Roteiro não encontrado.</p>
      </div>
    );
  }

  const isDirty = content !== (history[history.length - 1]?.note === "Edição salva" ? content : source.content);

  const handleSave = () => {
    if (!content.trim()) return;
    const entry: RoteiroHistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: now(),
      action: "editado",
      note: "Edição salva pelo cliente.",
      author: "João Silva",
    };
    setHistory((prev) => [...prev, entry]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleApprove = () => {
    if (status === "revisado") return;
    const entry: RoteiroHistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: now(),
      action: "aprovado",
      note: "Roteiro aprovado pelo cliente.",
      author: "João Silva",
    };
    setHistory((prev) => [...prev, entry]);
    setStatus("revisado");
    setApproved(true);
  };

  const actionIcon = (action: string) => {
    if (action === "criado") return { color: "#6B7280", icon: "M12 4v16m8-8H4" };
    if (action === "editado") return { color: "#D4FF3F", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" };
    return { color: "#10B981", icon: "M5 13l4 4L19 7" };
  };

  const color = typeColor[source.type];

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
              {typeLabel[source.type]}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: status === "revisado" ? "#10B98122" : "#F59E0B22",
                color: status === "revisado" ? "#10B981" : "#F59E0B",
              }}
            >
              {status === "revisado" ? "Aprovado" : "Pendente"}
            </span>
          </div>
          <h1 className="font-bold text-base truncate">{source.title}</h1>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>TEXTO DO ROTEIRO</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full text-sm leading-relaxed resize-none outline-none"
          style={{ background: "transparent", color: "#E5E7EB", caretColor: "#D4FF3F" }}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm mb-3 transition-all active:scale-[0.97]"
        style={{
          background: saved ? "#10B981" : "#1A1A22",
          color: saved ? "#fff" : "#D4FF3F",
          border: `1px solid ${saved ? "#10B981" : "#D4FF3F"}`,
        }}
      >
        {saved ? "✓ Alterações salvas" : "Salvar alterações"}
      </button>

      {/* Approve */}
      {status === "pendente" ? (
        <button
          onClick={handleApprove}
          className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
          style={{ background: "#D4FF3F", color: "#0B0B0F" }}
        >
          Aprovar roteiro
        </button>
      ) : (
        <div
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-center"
          style={{ background: "#10B98122", color: "#10B981", border: "1px solid #10B981" }}
        >
          ✓ Roteiro aprovado
        </div>
      )}

      {/* History */}
      <div className="mt-8">
        <p className="text-xs font-semibold mb-4" style={{ color: "#9CA3AF" }}>HISTÓRICO DE ALTERAÇÕES</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: "#2A2A38" }} />

          <div className="flex flex-col gap-0">
            {history.map((entry, i) => {
              const { color: dotColor, icon } = actionIcon(entry.action);
              return (
                <div key={entry.id} className="flex gap-4 pb-5 relative">
                  {/* Dot */}
                  <div
                    className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${dotColor}22`, border: `1.5px solid ${dotColor}` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={dotColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                  {/* Content */}
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
