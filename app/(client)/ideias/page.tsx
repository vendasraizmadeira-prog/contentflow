"use client";
import { useState, useRef } from "react";

type Idea = { id: string; type: string; text: string; link?: string; images?: string[]; timestamp: string };

const types = [
  { key: "post", label: "Post", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "carousel", label: "Carrossel", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "reel", label: "Reels", icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { key: "story", label: "Stories", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

const mockIdeas: Idea[] = [
  { id: "1", type: "post", text: "Quero algo nesse estilo, com cores mais vibrantes e uma mensagem sobre autocuidado.", link: "https://instagram.com/p/exemplo", timestamp: "há 2 dias" },
  { id: "2", type: "reel", text: "Trend do TikTok com transição de antes/depois dos produtos.", timestamp: "há 5 dias" },
];

export default function Ideias() {
  const [selectedType, setSelectedType] = useState("post");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 4));
  };

  const submit = () => {
    if (!text.trim()) return;
    setIdeas([{ id: Date.now().toString(), type: selectedType, text, link, images: imagePreviews, timestamp: "agora" }, ...ideas]);
    setText("");
    setLink("");
    setImagePreviews([]);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Ideias & Referências</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Envie ideias e referências que você gostou</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        {/* Close-like header no mobile */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Enviar Ideia</h3>
        </div>

        {/* Type selector */}
        <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>TIPO DE CONTEÚDO</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className="py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all active:scale-[0.96]"
              style={{
                background: selectedType === t.key ? "rgba(212,255,63,0.12)" : "#0B0B0F",
                border: `1px solid ${selectedType === t.key ? "#D4FF3F" : "#2A2A38"}`,
                color: selectedType === t.key ? "#D4FF3F" : "#6B7280",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Text */}
        <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>SUA IDEIA OU REFERÊNCIA</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quero algo nesse estilo, com cores mais vibrantes e uma mensagem sobre autocuidado."
          rows={4}
          className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none mb-4"
          style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
        />

        {/* Link */}
        <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>LINK DE REFERÊNCIA (opcional)</p>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://instagram.com/p/..."
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-4"
          style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
        />

        {/* Image upload */}
        <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>IMAGEM DE REFERÊNCIA (opcional)</p>
        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        <div className="flex gap-2 mb-5">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImagePreviews(imagePreviews.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {imagePreviews.length < 4 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#0B0B0F", border: "1px solid #2A2A38" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          )}
        </div>

        <button
          onClick={submit}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] hover:opacity-90"
          style={{ background: "#D4FF3F", color: "#0B0B0F" }}
        >
          Enviar Ideia
        </button>
      </div>

      {/* History */}
      {ideas.length > 0 && (
        <>
          <h2 className="font-semibold mb-3 text-sm" style={{ color: "#9CA3AF" }}>ENVIADAS ANTERIORMENTE</h2>
          <div className="flex flex-col gap-3">
            {ideas.map((idea) => {
              const t = types.find((t) => t.key === idea.type);
              return (
                <div key={idea.id} className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {t && (
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(212,255,63,0.12)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                        </div>
                      )}
                      <span className="text-xs font-medium" style={{ color: "#D4FF3F" }}>{t?.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#6B7280" }}>{idea.timestamp}</span>
                  </div>
                  <p className="text-sm" style={{ color: "#D1D5DB" }}>{idea.text}</p>
                  {idea.link && <p className="text-xs mt-1.5" style={{ color: "#7B4DFF" }}>{idea.link}</p>}
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
      )}
    </div>
  );
}
