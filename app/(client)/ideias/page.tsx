"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Idea = { id: string; type: string; text: string; link?: string | null; images?: string[]; created_at: string; };

const types = [
  { key: "post",      label: "Post",      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "carousel",  label: "Carrossel", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "reel",      label: "Reels",     icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { key: "story",     label: "Stories",   icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export default function Ideias() {
  const [selectedType, setSelectedType] = useState("post");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ideas")
        .select("id,type,text,link,images,created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setIdeas(data ?? []);
      setLoading(false);
    })();
  }, []);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 4));
  };

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const { data: newIdea } = await supabase
      .from("ideas")
      .insert({ client_id: user.id, type: selectedType, text, link: link || null, images: imagePreviews })
      .select("id,type,text,link,images,created_at")
      .single();

    if (newIdea) setIdeas(prev => [newIdea, ...prev]);
    setText("");
    setLink("");
    setImagePreviews([]);
    setSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Ideias & Referências</h1>
        <p className="text-sm mt-0.5" style={{ color: "#5A5A7A" }}>Envie ideias e referências que você gostou</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Enviar Ideia</h3>
        </div>

        <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#5A5A7A" }}>TIPO DE CONTEÚDO</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className="py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all active:scale-[0.96] cursor-pointer"
              style={{
                background: selectedType === t.key ? "rgba(212,255,63,0.1)" : "#13132A",
                border: `1px solid ${selectedType === t.key ? "#D4FF3F" : "#22223A"}`,
                color: selectedType === t.key ? "#D4FF3F" : "#5A5A7A",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#5A5A7A" }}>SUA IDEIA OU REFERÊNCIA</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quero algo nesse estilo, com cores mais vibrantes e uma mensagem sobre autocuidado."
          rows={4}
          className="w-full px-4 py-3 rounded-2xl text-sm resize-none mb-4"
          style={{ background: "#13132A", border: "1px solid #22223A", color: "#F0F0FF", outline: "none" }}
        />

        <p className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#5A5A7A" }}>LINK DE REFERÊNCIA (opcional)</p>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://instagram.com/p/..."
          className="w-full px-4 py-3 rounded-2xl text-sm mb-4"
          style={{ background: "#13132A", border: "1px solid #22223A", color: "#F0F0FF", outline: "none" }}
        />

        <p className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#5A5A7A" }}>IMAGEM DE REFERÊNCIA (opcional)</p>
        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        <div className="flex gap-2 mb-5">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImagePreviews(imagePreviews.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {imagePreviews.length < 4 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: "#13132A", border: "1px solid #22223A" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5A7A" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          )}
        </div>

        <button
          onClick={submit}
          disabled={submitting || !text.trim()}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] cursor-pointer disabled:opacity-40"
          style={{ background: "#D4FF3F", color: "#0B0B0F" }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Enviando...
            </span>
          ) : "Enviar Ideia"}
        </button>
      </div>

      {/* History */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#0F0F1E" }} />)}
        </div>
      ) : ideas.length > 0 ? (
        <>
          <h2 className="font-semibold mb-3 text-xs tracking-wide" style={{ color: "#5A5A7A" }}>ENVIADAS ANTERIORMENTE</h2>
          <div className="flex flex-col gap-3">
            {ideas.map((idea) => {
              const t = types.find((t) => t.key === idea.type);
              return (
                <div key={idea.id} className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #17172A" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {t && (
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(212,255,63,0.1)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                        </div>
                      )}
                      <span className="text-xs font-semibold" style={{ color: "#D4FF3F" }}>{t?.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#3A3A58" }}>{timeAgo(idea.created_at)}</span>
                  </div>
                  <p className="text-sm" style={{ color: "#9A9ABE" }}>{idea.text}</p>
                  {idea.link && <p className="text-xs mt-1.5 truncate" style={{ color: "#7B4DFF" }}>{idea.link}</p>}
                  {idea.images && idea.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {idea.images.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
