"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Revision = {
  id: string;
  timestamp: string;
  type: "change_request" | "approved" | "caption_edit";
  note: string;
  author: string;
  author_id: string;
  time?: number | null;
  status?: "pending" | "resolved" | "cancelled";
};

type Content = {
  id: string;
  type: string;
  status: string;
  images: string[];
  caption: string | null;
  revisions: Revision[];
};

type Profile = {
  id: string;
  name: string;
  instagram: string | null;
  avatar: string | null;
};

const statusLabels: Record<string, { label: string; bg: string; color: string }> = {
  aguardando: { label: "Aguardando", bg: "rgba(107,114,128,0.15)", color: "#9CA3AF" },
  em_revisao: { label: "Em revisão",  bg: "rgba(251,191,36,0.15)",  color: "#FBBF24" },
  aprovado:   { label: "Aprovado",    bg: "rgba(34,197,94,0.15)",   color: "#22C55E" },
  agendado:   { label: "Agendado",    bg: "rgba(129,140,248,0.15)", color: "#818CF8" },
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "agora";
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

type Comment = { id: string; text: string; time: number; resolved: boolean };

export default function ReelsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [content, setContent] = useState<Content | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showChange, setShowChange] = useState(false);
  const [changeText, setChangeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: item }, { data: prof }] = await Promise.all([
        supabase
          .from("producao_items")
          .select("id, type, status, images, caption, revisions")
          .eq("id", id)
          .eq("client_id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("id, name, instagram, avatar")
          .eq("id", user.id)
          .single(),
      ]);

      if (item) {
        setContent({
          id: item.id,
          type: item.type,
          status: item.status,
          images: item.images ?? [],
          caption: item.caption ?? null,
          revisions: item.revisions ?? [],
        });
      }
      if (prof) {
        setProfile(prof);
        setUserName(prof.name ?? "");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const notifyAdmins = async (title: string, message: string, type: string) => {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole: "admin", title, message, type, url: "/admin/conteudos" }),
    });
  };

  const handleApprove = async () => {
    if (!content || saving) return;
    setSaving(true);
    const supabase = createClient();
    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "approved",
      note: "Reels aprovado",
      author: userName,
      author_id: userId,
    };
    const newRevisions = [...content.revisions, revision];
    const { error } = await supabase.from("producao_items").update({ status: "aprovado", revisions: newRevisions }).eq("id", content.id);
    if (!error) {
      setContent({ ...content, status: "aprovado", revisions: newRevisions });
      notifyAdmins(`Reels aprovado por ${userName}`, "Reels aprovado", "approved");
      showToast("Reels aprovado!");
    }
    setSaving(false);
  };

  const handleChangeRequest = async () => {
    if (!content || !changeText.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();
    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "change_request",
      note: changeText.trim(),
      author: userName,
      author_id: userId,
      time: currentTime > 0 ? currentTime : null,
      status: "pending",
    };
    const newRevisions = [...content.revisions, revision];
    const { error } = await supabase.from("producao_items").update({ revisions: newRevisions }).eq("id", content.id);
    if (!error) {
      setContent({ ...content, revisions: newRevisions });
      notifyAdmins(`Alteração solicitada por ${userName}`, changeText.trim(), "change_request");
      showToast("Solicitação enviada!");
    }
    setChangeText("");
    setShowChange(false);
    setSaving(false);
  };

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

  const goToTime = (t: number) => {
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now().toString(), text: newComment, time: currentTime, resolved: false }]);
    setNewComment("");
  };

  const resolveComment = (cid: string) => {
    setComments(comments.map((c) => (c.id === cid ? { ...c, resolved: true } : c)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#D4FF3F", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-6 text-center" style={{ color: "#6B7280" }}>
        <p className="text-lg font-semibold mb-2">Conteúdo não encontrado</p>
        <button onClick={() => router.back()} className="text-sm" style={{ color: "#D4FF3F" }}>Voltar</button>
      </div>
    );
  }

  const videoUrl = content.images?.[0] ?? "";
  const st = statusLabels[content.status] ?? statusLabels.aguardando;
  const isApproved = content.status === "aprovado";
  const canApprove = content.status === "em_revisao";
  const pendingRequests = content.revisions.filter((r) => r.type === "change_request" && r.status === "pending" && r.author_id === userId);

  const VideoPlayer = ({ vertical }: { vertical?: boolean }) => (
    <div className="relative overflow-hidden" style={{ background: "#000", aspectRatio: vertical ? "9/16" : "16/9" }}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onEnded={() => setPlaying(false)}
          playsInline
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <p className="text-xs" style={{ color: "#4B5563" }}>Vídeo não disponível</p>
        </div>
      )}
      <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
        {!playing && videoUrl && (
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        )}
      </button>
      <div className="absolute bottom-3 left-3 text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.7)" }}>
        {formatTime(currentTime)} {duration > 0 && `/ ${formatTime(duration)}`}
      </div>
    </div>
  );

  const Timeline = () => (
    <div className="px-4 py-3" style={{ background: "#0F0F1E" }}>
      <div className="relative cursor-pointer mb-3" style={{ height: 24 }} onClick={handleSeek}>
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full" style={{ background: "#22223A" }} />
        <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ background: "#D4FF3F", width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }} />
        {duration > 0 && comments.map((c) => (
          <div key={c.id} onClick={(e) => { e.stopPropagation(); goToTime(c.time); }} className="absolute top-1/2 w-3 h-3 rounded-full cursor-pointer" style={{ left: `${(c.time / duration) * 100}%`, background: c.resolved ? "#22C55E" : "#7B4DFF", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
        ))}
        <div className="absolute top-1/2 w-4 h-4 rounded-full" style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%", background: "#D4FF3F", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => goToTime(Math.max(0, currentTime - 5))} className="text-xs px-2 py-1 rounded-lg" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>-5s</button>
        <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#D4FF3F" }}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B0B0F"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="#0B0B0F"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>
        <button onClick={() => goToTime(Math.min(duration, currentTime + 5))} className="text-xs px-2 py-1 rounded-lg" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>+5s</button>
      </div>
    </div>
  );

  const ActionButtons = () => {
    if (isApproved) {
      return (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="font-semibold text-sm" style={{ color: "#22C55E" }}>Reels aprovado!</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2.5">
        {canApprove && (
          <button onClick={handleApprove} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all disabled:opacity-60" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
            {saving ? "Salvando..." : "Aprovar"}
          </button>
        )}
        <button onClick={() => setShowChange(true)} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all disabled:opacity-60" style={{ border: "1px solid #22223A", color: "#fff" }}>
          Solicitar alteração
        </button>
        {pendingRequests.length > 0 && (
          <p className="text-xs text-center" style={{ color: "#FBBF24" }}>
            {pendingRequests.length} solicitação(ões) pendente(s)
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "#0B0B0F", borderBottom: "1px solid #1E1E2A" }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm" style={{ color: "#9CA3AF" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <p className="text-sm font-semibold">Reels</p>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden flex flex-col">
        <VideoPlayer />
        <Timeline />

        {/* Comments */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>COMENTÁRIOS NO VÍDEO</p>
          <div className="flex flex-col gap-2">
            {comments.map((c) => (
              <div key={c.id} onClick={() => goToTime(c.time)} className="flex items-center gap-3 rounded-xl p-3 active:opacity-70" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: "#D4FF3F" }}>{formatTime(c.time)}</span>
                <p className="text-sm flex-1" style={{ color: c.resolved ? "#6B7280" : "#fff", textDecoration: c.resolved ? "line-through" : "none" }}>{c.text}</p>
                {!c.resolved && (
                  <button onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }} className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </button>
                )}
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs" style={{ color: "#4B5563" }}>Nenhum comentário ainda. Pause no trecho e adicione abaixo.</p>
            )}
          </div>
        </div>

        {/* Add comment */}
        <div className="px-4 pb-3">
          <div className="rounded-2xl p-3" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="flex items-center gap-2 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="text-xs" style={{ color: "#D4FF3F" }}>+ Comentar em {formatTime(currentTime)}</span>
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="O que precisa mudar aqui?" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }} onKeyDown={(e) => e.key === "Enter" && addComment()} />
              <button onClick={addComment} className="px-3 py-2 rounded-xl text-sm font-medium" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky action buttons */}
        <div className="sticky bottom-20 left-0 right-0 px-4 pb-4 pt-3" style={{ background: "linear-gradient(to top, #0B0B0F 80%, transparent)" }}>
          <ActionButtons />
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #22223A" }}>
              <VideoPlayer vertical />
              <div className="p-4" style={{ background: "#0F0F1E" }}>
                <div className="relative cursor-pointer mb-3" style={{ height: 20 }} onClick={handleSeek}>
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full" style={{ background: "#22223A" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ background: "#D4FF3F", width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }} />
                  {comments.map((c) => (
                    <div key={c.id} onClick={(e) => { e.stopPropagation(); goToTime(c.time); }} className="absolute top-1/2 w-3 h-3 rounded-full cursor-pointer" style={{ left: duration > 0 ? `${(c.time / duration) * 100}%` : "0%", background: c.resolved ? "#22C55E" : "#7B4DFF", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
                  ))}
                  <div className="absolute top-1/2 w-4 h-4 rounded-full" style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%", background: "#D4FF3F", border: "2px solid #0B0B0F", transform: "translateY(-50%) translateX(-50%)" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#6B7280" }}>{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => goToTime(Math.max(0, currentTime - 5))} className="text-xs" style={{ color: "#9CA3AF" }}>-5s</button>
                    <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#D4FF3F" }}>
                      {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0B0F"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="#0B0B0F"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                    </button>
                    <button onClick={() => goToTime(Math.min(duration, currentTime + 5))} className="text-xs" style={{ color: "#9CA3AF" }}>+5s</button>
                  </div>
                  <span className="text-xs" style={{ color: "#6B7280" }}>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ActionButtons />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <h3 className="font-semibold mb-4">Comentários no vídeo</h3>
              <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-xl p-3 cursor-pointer hover:opacity-80" style={{ background: "#0B0B0F" }} onClick={() => goToTime(c.time)}>
                    <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: "#D4FF3F" }}>{formatTime(c.time)}</span>
                    <p className="text-sm flex-1" style={{ color: c.resolved ? "#6B7280" : "#fff", textDecoration: c.resolved ? "line-through" : "none" }}>{c.text}</p>
                    {!c.resolved && <button onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>ok</button>}
                  </div>
                ))}
                {comments.length === 0 && <p className="text-xs" style={{ color: "#4B5563" }}>Nenhum comentário</p>}
              </div>
              <div className="rounded-xl p-3" style={{ background: "#0B0B0F", border: "1px solid #22223A" }}>
                <p className="text-xs mb-2" style={{ color: "#D4FF3F" }}>+ Adicionar em {formatTime(currentTime)}</p>
                <div className="flex gap-2">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adicionar comentário..." className="flex-1 p-2 rounded-lg text-sm outline-none bg-transparent" style={{ color: "#fff" }} onKeyDown={(e) => e.key === "Enter" && addComment()} />
                  <button onClick={addComment} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Enviar</button>
                </div>
              </div>
            </div>

            {content.revisions.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                <h3 className="font-semibold mb-3 text-sm">Histórico</h3>
                <div className="flex flex-col gap-2">
                  {[...content.revisions].reverse().map((r) => {
                    const iconColor = r.type === "approved" ? "#22C55E" : r.status === "cancelled" ? "#4B5563" : "#FBBF24";
                    return (
                      <div key={r.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "#0B0B0F", opacity: r.status === "cancelled" ? 0.5 : 1 }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${iconColor}20` }}>
                          {r.type === "approved"
                            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                          }
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{r.note}</p>
                          <p className="text-xs" style={{ color: "#6B7280" }}>{r.author} • {timeAgo(r.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change request modal */}
      {showChange && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4 md:hidden" style={{ background: "#22223A" }} />
            <h3 className="font-bold mb-1">Solicitar alteração</h3>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>Trecho: {formatTime(currentTime)} — Descreva o que precisa mudar</p>
            <textarea value={changeText} onChange={(e) => setChangeText(e.target.value)} placeholder="Ex: Trocar esse take, colocar legenda maior..." rows={4} className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none outline-none mb-4" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }} autoFocus />
            <div className="flex gap-3">
              <button onClick={() => { setShowChange(false); setChangeText(""); }} className="flex-1 py-3 rounded-2xl text-sm" style={{ border: "1px solid #22223A", color: "#9CA3AF" }}>Cancelar</button>
              <button onClick={handleChangeRequest} disabled={!changeText.trim() || saving} className="flex-1 py-3 rounded-2xl text-sm font-bold disabled:opacity-40" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                {saving ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 px-4 py-3 rounded-2xl text-sm font-semibold text-center" style={{ background: "#10B981", color: "#fff" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
