"use client";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockContents } from "@/lib/mock-data";

type Comment = { id: string; text: string; time: number; resolved: boolean };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ReelsPage() {
  const { id } = useParams();
  const router = useRouter();
  const content = mockContents.find((c) => c.id === id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(45);
  const [comments, setComments] = useState<Comment[]>([
    { id: "1", text: "Trocar esse take", time: 7, resolved: false },
    { id: "2", text: "Colocar legenda maior", time: 15, resolved: false },
    { id: "3", text: "Cortar essa parte", time: 22, resolved: false },
  ]);
  const [newComment, setNewComment] = useState("");
  const [approved, setApproved] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [changeText, setChangeText] = useState("");

  const togglePlay = () => {
    if (videoRef.current) {
      playing ? videoRef.current.pause() : videoRef.current.play();
      setPlaying(!playing);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * duration;
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now().toString(), text: newComment, time: currentTime, resolved: false }]);
    setNewComment("");
  };

  const goToTime = (t: number) => {
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
  };

  const resolveComment = (cid: string) => {
    setComments(comments.map((c) => (c.id === cid ? { ...c, resolved: true } : c)));
  };

  if (!content) return <div className="p-6 text-white">Conteúdo não encontrado</div>;

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{ background: "#0B0B0F", borderBottom: "1px solid #1E1E2A" }}
      >
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm" style={{ color: "#9CA3AF" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">Reels - Edição</p>
          <p className="text-xs" style={{ color: "#6B7280" }}>ID #{content.id}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}>
          Em revisão
        </span>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden flex flex-col">
        {/* Video */}
        <div className="relative" style={{ background: "#000" }}>
          <div className="relative" style={{ aspectRatio: "16/9" }}>
            <video
              ref={videoRef}
              src={(content as any).videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
              className="w-full h-full object-cover"
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 45)}
              onEnded={() => setPlaying(false)}
            />
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
              {!playing && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              )}
            </button>
            {/* Time overlay */}
            <div className="absolute bottom-3 left-3 text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.7)" }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Timeline */}
          <div className="px-4 py-3" style={{ background: "#1A1A22" }}>
            <div className="relative cursor-pointer" style={{ height: 24 }} onClick={handleSeek}>
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full" style={{ background: "#2A2A38" }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
                style={{ background: "#D4FF3F", width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
              {/* Comment dots */}
              {duration > 0 && comments.map((c) => (
                <div
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); goToTime(c.time); }}
                  className="absolute top-1/2 w-3 h-3 rounded-full cursor-pointer"
                  style={{
                    left: `${(c.time / duration) * 100}%`,
                    background: c.resolved ? "#22C55E" : "#7B4DFF",
                    border: "2px solid #0B0B0F",
                    transform: "translateY(-50%) translateX(-50%)",
                  }}
                />
              ))}
              {/* Thumb */}
              <div
                className="absolute top-1/2 w-4 h-4 rounded-full"
                style={{
                  left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                  background: "#D4FF3F",
                  border: "2px solid #0B0B0F",
                  transform: "translateY(-50%) translateX(-50%)",
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => goToTime(Math.max(0, currentTime - 5))} className="text-xs px-2 py-1 rounded-lg" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>-5s</button>
              <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#D4FF3F" }}>
                {playing
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B0B0F"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B0B0F"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                }
              </button>
              <button onClick={() => goToTime(Math.min(duration, currentTime + 5))} className="text-xs px-2 py-1 rounded-lg" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>+5s</button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>COMENTÁRIOS</p>
          <div className="flex flex-col gap-2">
            {comments.map((c) => (
              <div
                key={c.id}
                onClick={() => goToTime(c.time)}
                className="flex items-center gap-3 rounded-xl p-3 active:opacity-70"
                style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}
              >
                <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: "#D4FF3F" }}>
                  {formatTime(c.time)}
                </span>
                <p className="text-sm flex-1" style={{ color: c.resolved ? "#6B7280" : "#fff", textDecoration: c.resolved ? "line-through" : "none" }}>
                  {c.text}
                </p>
                {!c.resolved && (
                  <button
                    onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,197,94,0.15)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </button>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            ))}
          </div>
        </div>

        {/* Add comment */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl p-3" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span className="text-xs" style={{ color: "#D4FF3F" }}>
                + Adicionar comentário em {formatTime(currentTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="O que precisa mudar aqui?"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <button onClick={addComment} className="px-3 py-2 rounded-xl text-sm font-medium" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-6 flex flex-col gap-3">
          {!approved ? (
            <>
              <button onClick={() => setApproved(true)} className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                Aprovar
              </button>
              <button onClick={() => setShowChange(true)} className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all" style={{ border: "1px solid #2A2A38", color: "#fff" }}>
                Solicitar alterações
              </button>
            </>
          ) : (
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <p className="font-semibold" style={{ color: "#22C55E" }}>Reels aprovado!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#000", border: "1px solid #2A2A38" }}>
              <div className="relative" style={{ aspectRatio: "9/16", maxHeight: 520 }}>
                <video ref={videoRef} src={(content as any).videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} className="w-full h-full object-cover"
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 45)}
                  onEnded={() => setPlaying(false)}
                />
                <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
                  {!playing && (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  )}
                </button>
              </div>
              <div className="p-4">
                <div className="relative cursor-pointer mb-3" style={{ height: 20 }} onClick={handleSeek}>
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full" style={{ background: "#2A2A38" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ background: "#D4FF3F", width: `${(currentTime / duration) * 100}%` }} />
                  {comments.map((c) => (
                    <div key={c.id} onClick={(e) => { e.stopPropagation(); goToTime(c.time); }} className="absolute top-1/2 w-3 h-3 rounded-full cursor-pointer" style={{ left: `${(c.time / duration) * 100}%`, background: c.resolved ? "#22C55E" : "#7B4DFF", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
                  ))}
                  <div className="absolute top-1/2 w-4 h-4 rounded-full" style={{ left: `${(currentTime / duration) * 100}%`, background: "#D4FF3F", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#6B7280" }}>{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => goToTime(Math.max(0, currentTime - 5))} className="text-xs" style={{ color: "#9CA3AF" }}>-5s</button>
                    <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#D4FF3F" }}>
                      {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0B0F"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0B0F"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
                    </button>
                    <button onClick={() => goToTime(Math.min(duration, currentTime + 5))} className="text-xs" style={{ color: "#9CA3AF" }}>+5s</button>
                  </div>
                  <span className="text-xs" style={{ color: "#6B7280" }}>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              {!approved ? (
                <>
                  <button onClick={() => setApproved(true)} className="flex-1 py-3.5 rounded-xl font-bold text-sm" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>✓ Aprovar</button>
                  <button onClick={() => setShowChange(true)} className="flex-1 py-3.5 rounded-xl font-bold text-sm" style={{ border: "1px solid #2A2A38" }}>Solicitar alteração</button>
                </>
              ) : (
                <div className="flex-1 rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <p className="font-semibold text-sm" style={{ color: "#22C55E" }}>Reels aprovado!</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5 flex-1" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <h3 className="font-semibold mb-4">Comentários no vídeo</h3>
              <div className="flex flex-col gap-2 mb-4 max-h-80 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-xl p-3 cursor-pointer hover:opacity-80" style={{ background: "#0B0B0F" }} onClick={() => goToTime(c.time)}>
                    <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: "#D4FF3F" }}>{formatTime(c.time)}</span>
                    <p className="text-sm flex-1" style={{ color: c.resolved ? "#6B7280" : "#fff", textDecoration: c.resolved ? "line-through" : "none" }}>{c.text}</p>
                    {!c.resolved && <button onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>ok</button>}
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3" style={{ background: "#0B0B0F", border: "1px solid #2A2A38" }}>
                <p className="text-xs mb-2" style={{ color: "#D4FF3F" }}>+ Adicionar em {formatTime(currentTime)}</p>
                <div className="flex gap-2">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adicionar comentário..." className="flex-1 p-2 rounded-lg text-sm outline-none bg-transparent" style={{ color: "#fff" }} />
                  <button onClick={addComment} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Comentar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showChange && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-28 md:pb-6" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <h3 className="font-bold mb-4">Solicitar alteração</h3>
            <textarea value={changeText} onChange={(e) => setChangeText(e.target.value)} placeholder="Descreva o que precisa mudar..." rows={4} className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none outline-none mb-4" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} />
            <div className="flex gap-3">
              <button onClick={() => setShowChange(false)} className="flex-1 py-3 rounded-2xl text-sm" style={{ border: "1px solid #2A2A38" }}>Cancelar</button>
              <button onClick={() => { setShowChange(false); setChangeText(""); }} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
