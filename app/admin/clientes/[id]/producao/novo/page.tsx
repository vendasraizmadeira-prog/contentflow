"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function NovaProducaoForm() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const sp = useSearchParams();
  const tipo = (sp.get("tipo") ?? "post") as "post" | "reel" | "carousel" | "story";
  const roteiroId = sp.get("roteiroId") ?? "";
  const titulo = sp.get("titulo") ?? "Novo Conteúdo";

  const [clientName, setClientName] = useState("");
  const [roteiroContent, setRoteiroContent] = useState("");
  const [postSubtype, setPostSubtype] = useState<"single" | "carousel">(tipo === "carousel" ? "carousel" : "single");
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoName, setVideoName] = useState("");
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [nameRes, roteiroRes] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", id).single(),
        roteiroId ? supabase.from("roteiros").select("content").eq("id", roteiroId).single() : Promise.resolve({ data: null }),
      ]);
      setClientName(nameRes.data?.name ?? "");
      setRoteiroContent(roteiroRes.data?.content ?? "");
    };
    load();
  }, [id, roteiroId]);

  const isVideo = tipo === "reel";
  const isImage = !isVideo;
  const maxImages = postSubtype === "carousel" ? 10 : 1;

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...previews].slice(0, maxImages));
  };

  const submit = async () => {
    if (isImage && images.length === 0) return;
    if (isVideo && !videoName) return;
    if (!caption.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("producao_items").insert({
      client_id: id,
      roteiro_id: roteiroId || null,
      roteiro_title: titulo,
      type: tipo,
      post_subtype: isVideo ? "single" : postSubtype,
      status: "em_revisao",
      images: isImage ? images : [],
      caption: caption.trim(),
      scheduled_date: scheduledDate || null,
    });
    if (roteiroId) {
      await supabase.from("roteiros").update({ producao_id: "pending" }).eq("id", roteiroId);
    }
    setSaving(false);
    router.push(`/admin/clientes/${id}/producao`);
  };

  const typeLabel = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" }[tipo];

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-5 w-fit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span className="text-sm" style={{ color: "#6B7280" }}>Produção — {clientName}</span>
      </button>

      <h1 className="text-xl font-bold mb-1">{titulo}</h1>
      <p className="text-xs mb-5" style={{ color: "#6B7280" }}>
        <span className="px-2 py-0.5 rounded-full mr-2" style={{ background: "#7B4DFF22", color: "#7B4DFF" }}>{typeLabel}</span>
        Subindo conteúdo para aprovação
      </p>

      {roteiroContent && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#10B981" }}>ROTEIRO APROVADO (referência)</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-4" style={{ color: "#9CA3AF" }}>
            {roteiroContent}
          </p>
        </div>
      )}

      <div className="rounded-2xl p-5 mb-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        {(tipo === "post" || tipo === "carousel") && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>FORMATO DO POST</p>
            <div className="flex gap-2 mb-5">
              {(["single", "carousel"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => { setPostSubtype(sub); setImages([]); }}
                  className="flex-1 py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all"
                  style={{
                    background: postSubtype === sub ? "rgba(123,77,255,0.15)" : "#0B0B0F",
                    border: `1px solid ${postSubtype === sub ? "#7B4DFF" : "#2A2A38"}`,
                    color: postSubtype === sub ? "#7B4DFF" : "#6B7280",
                  }}
                >
                  {sub === "single" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                  )}
                  <span className="text-xs font-medium">{sub === "single" ? "Post único" : "Carrossel"}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {isImage && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>
              {postSubtype === "carousel" ? `SLIDES (${images.length}/${maxImages})` : "IMAGEM DO POST"}
            </p>
            <input ref={imgRef} type="file" multiple={postSubtype === "carousel"} accept="image/*" onChange={handleImages} className="hidden" />
            <div className="flex flex-wrap gap-2 mb-4">
              {images.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>{i + 1}</div>
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              {images.length < maxImages && (
                <button onClick={() => imgRef.current?.click()} className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0" style={{ background: "#0B0B0F", border: "1px dashed #2A2A38" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  <span className="text-xs" style={{ color: "#6B7280" }}>Adicionar</span>
                </button>
              )}
            </div>
          </>
        )}

        {isVideo && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>ARQUIVO DE VÍDEO</p>
            <input ref={vidRef} type="file" accept="video/*" onChange={(e) => setVideoName(e.target.files?.[0]?.name ?? "")} className="hidden" />
            <button onClick={() => vidRef.current?.click()} className="w-full py-8 rounded-2xl flex flex-col items-center gap-3 mb-4 transition-all" style={{ background: videoName ? "rgba(123,77,255,0.1)" : "#0B0B0F", border: `1px dashed ${videoName ? "#7B4DFF" : "#2A2A38"}` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={videoName ? "#7B4DFF" : "#6B7280"} strokeWidth="2" strokeLinecap="round">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              <span className="text-sm" style={{ color: videoName ? "#7B4DFF" : "#6B7280" }}>
                {videoName || "Clique para selecionar o vídeo"}
              </span>
            </button>
          </>
        )}

        <p className="text-xs font-semibold mb-2" style={{ color: "#9CA3AF" }}>LEGENDA / DESCRIÇÃO</p>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Escreva a legenda que será publicada junto ao conteúdo..." rows={5} className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} />

        <p className="text-xs font-semibold mb-2" style={{ color: "#9CA3AF" }}>DATA DE PUBLICAÇÃO (opcional)</p>
        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} />
      </div>

      <button onClick={submit} disabled={saving || (isImage && images.length === 0) || (isVideo && !videoName) || !caption.trim()} className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50" style={{ background: "#7B4DFF", color: "#fff" }}>
        {saving ? "Enviando..." : "Enviar para revisão do cliente"}
      </button>
    </div>
  );
}

export default function NovaProducao() {
  return (
    <Suspense>
      <NovaProducaoForm />
    </Suspense>
  );
}
