"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockContents, mockClient } from "@/lib/mock-data";

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const content = mockContents.find((c) => c.id === id);
  const [slide, setSlide] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [approved, setApproved] = useState(false);
  const [ideaText, setIdeaText] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [tab, setTab] = useState<"post" | "roteiro" | "ideias">("post");

  if (!content) return <div className="p-6 text-white">Conteúdo não encontrado</div>;

  const images = (content as any).images || [content.thumbnail];
  const isCarousel = images.length > 1;

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "#0B0B0F", borderBottom: "1px solid #1E1E2A" }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm" style={{ color: "#9CA3AF" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{isCarousel ? "Post Carrossel" : "Post"}</p>
          <p className="text-xs" style={{ color: "#6B7280" }}>ID #{content.id}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}>
          Em revisão
        </span>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden">
        {/* Instagram preview */}
        <div style={{ background: "#1A1A22" }}>
          {/* IG account bar */}
          <div className="flex items-center gap-2.5 px-4 py-3">
            <img src={mockClient.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-xs font-semibold">{mockClient.instagram.replace("@", "")}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Patrocinado</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
            <img src={images[slide]} alt="" className="w-full h-full object-cover" />
            {isCarousel && (
              <>
                <button
                  onClick={() => setSlide(Math.max(0, slide - 1))}
                  disabled={slide === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  onClick={() => setSlide(Math.min(images.length - 1, slide + 1))}
                  disabled={slide === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>
                  {slide + 1}/{images.length}
                </div>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <div
                      key={i}
                      onClick={() => setSlide(i)}
                      className="rounded-full transition-all cursor-pointer"
                      style={{ width: i === slide ? 16 : 6, height: 6, background: i === slide ? "#fff" : "rgba(255,255,255,0.45)" }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* IG action row */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-4 mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" className="ml-auto"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
            </div>
            <p className="text-xs">
              <span className="font-semibold">{mockClient.instagram.replace("@", "")}</span>{" "}
              <span style={{ color: "#D1D5DB" }}>{content.script?.slice(0, 90)}...</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Ver todos os 24 comentários</p>
          </div>
        </div>

        {/* Tabs roteiro/ideias */}
        <div className="flex" style={{ borderBottom: "1px solid #1E1E2A" }}>
          {(["post", "roteiro", "ideias"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-xs font-medium capitalize"
              style={{
                color: tab === t ? "#D4FF3F" : "#6B7280",
                borderBottom: tab === t ? "2px solid #D4FF3F" : "2px solid transparent",
              }}
            >
              {t === "post" ? "Preview" : t === "roteiro" ? "Roteiro" : "Ideias"}
            </button>
          ))}
        </div>

        {tab === "roteiro" && (
          <div className="p-4">
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#D1D5DB" }}>{content.script}</p>
          </div>
        )}

        {tab === "ideias" && (
          <div className="p-4 flex flex-col gap-3">
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Quero algo nesse estilo, com cores mais vibrantes..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none"
              style={{ background: "#1A1A22", border: "1px solid #2A2A38", color: "#fff" }}
            />
            <input
              placeholder="Link de referência (opcional)"
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: "#1A1A22", border: "1px solid #2A2A38", color: "#fff" }}
            />
            <button
              onClick={() => { if (ideaText.trim()) { setIdeas([...ideas, ideaText]); setIdeaText(""); } }}
              className="w-full py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: "#D4FF3F", color: "#0B0B0F" }}
            >
              Enviar ideia
            </button>
            {ideas.map((idea, i) => (
              <div key={i} className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(212,255,63,0.08)", color: "#D4FF3F" }}>
                "{idea}"
              </div>
            ))}
          </div>
        )}

        {/* Actions — sempre visíveis no bottom */}
        {tab === "post" && (
          <div className="p-4 flex flex-col gap-3">
            {!approved ? (
              <>
                <button
                  onClick={() => setApproved(true)}
                  className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all"
                  style={{ background: "#D4FF3F", color: "#0B0B0F" }}
                >
                  Aprovar
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all"
                  style={{ border: "1px solid #2A2A38", color: "#fff" }}
                >
                  Solicitar alterações
                </button>
              </>
            ) : (
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="font-semibold" style={{ color: "#22C55E" }}>Conteúdo aprovado!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DESKTOP layout ── */}
      <div className="hidden md:block p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{content.title}</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>ID #{content.id} • {content.date}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: "#6B7280" }}>PREVIEW INSTAGRAM</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#1A1A22", border: "1px solid #2A2A38", maxWidth: 380 }}>
              <div className="flex items-center gap-2 p-3">
                <img src={mockClient.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold">{mockClient.instagram.replace("@", "")}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>Patrocinado</p>
                </div>
              </div>
              <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <img src={images[slide]} alt="" className="w-full h-full object-cover" />
                {isCarousel && (
                  <>
                    <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button onClick={() => setSlide(Math.min(images.length - 1, slide + 1))} disabled={slide === images.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>{slide + 1}/{images.length}</div>
                  </>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs">{mockClient.instagram.replace("@", "")} <span style={{ color: "#D1D5DB" }}>{content.script?.slice(0, 80)}...</span></p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <h3 className="text-sm font-semibold mb-3">Roteiro / Legenda</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#D1D5DB" }}>{content.script}</p>
            </div>
            {!approved ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => setApproved(true)} className="w-full py-3.5 rounded-xl font-bold text-sm" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>✓ Aprovar</button>
                <button onClick={() => setShowModal(true)} className="w-full py-3.5 rounded-xl font-bold text-sm" style={{ border: "1px solid #2A2A38", color: "#fff" }}>Solicitar alteração</button>
              </div>
            ) : (
              <div className="rounded-2xl p-5 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="font-semibold" style={{ color: "#22C55E" }}>Aprovado!</p>
              </div>
            )}
            <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <h3 className="text-sm font-semibold mb-3">Enviar ideia ou referência</h3>
              <textarea value={ideaText} onChange={(e) => setIdeaText(e.target.value)} placeholder="Descreva sua ideia..." rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none mb-3" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} />
              <button onClick={() => { if (ideaText.trim()) { setIdeas([...ideas, ideaText]); setIdeaText(""); } }} className="w-full py-2.5 rounded-xl text-sm font-medium" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Enviar ideia</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal alteração */}
      {showModal && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-28 md:pb-6" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <h3 className="font-bold mb-1">Solicitar alteração</h3>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>Descreva o que precisa ser alterado</p>
            <textarea value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex: Trocar a cor do fundo, ajustar o texto..." rows={4} className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none outline-none mb-4" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl text-sm" style={{ border: "1px solid #2A2A38" }}>Cancelar</button>
              <button onClick={() => { setShowModal(false); setChangeNote(""); }} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
