"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Revision = { id: string; type: string; note: string; author: string; author_id: string; timestamp: string; status?: string };
type Reel = {
  id: string;
  status: string;
  images: string[];
  caption: string | null;
  revisions: Revision[];
  created_at: string;
};
type Profile = { name: string | null; instagram: string | null; avatar: string | null };

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [commentNote, setCommentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [profRes, reelsRes] = await Promise.all([
        supabase.from("profiles").select("name,instagram,avatar").eq("id", user.id).single(),
        supabase
          .from("producao_items")
          .select("id,status,images,caption,revisions,created_at")
          .eq("client_id", user.id)
          .eq("type", "reel")
          .in("status", ["em_revisao", "aprovado", "agendado"])
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profRes.data);
      setUserName(profRes.data?.name ?? "");
      setReels((reelsRes.data ?? []).map((r) => ({ ...r, images: r.images ?? [], revisions: r.revisions ?? [] })));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    const children = container.querySelectorAll("[data-index]");
    children.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleLike = async (reel: Reel) => {
    const isApproved = reel.status === "aprovado" || reel.revisions.some((r) => r.type === "approved");
    if (isApproved || saving) return;
    setSaving(true);
    const supabase = createClient();
    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "approved",
      note: "Reel aprovado",
      author: userName,
      author_id: userId,
    };
    const newRevisions = [...reel.revisions, revision];
    const { error } = await supabase
      .from("producao_items")
      .update({ status: "aprovado", revisions: newRevisions })
      .eq("id", reel.id);

    if (!error) {
      setReels((prev) =>
        prev.map((r) => r.id === reel.id ? { ...r, status: "aprovado", revisions: newRevisions } : r)
      );
      showToast("Reel aprovado! ✓");
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: "admin", title: `Reel aprovado por ${userName}`, message: "O cliente aprovou o reel", type: "approved", url: "/admin/conteudos" }),
      });
    }
    setSaving(false);
  };

  const handleComment = async () => {
    if (!commentReelId || !commentNote.trim() || saving) return;
    const reel = reels.find((r) => r.id === commentReelId);
    if (!reel) return;
    setSaving(true);
    const supabase = createClient();
    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "change_request",
      note: commentNote.trim(),
      author: userName,
      author_id: userId,
      status: "pending",
    };
    const newRevisions = [...reel.revisions, revision];
    const { error } = await supabase
      .from("producao_items")
      .update({ revisions: newRevisions })
      .eq("id", commentReelId);

    if (!error) {
      setReels((prev) =>
        prev.map((r) => r.id === commentReelId ? { ...r, revisions: newRevisions } : r)
      );
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: "admin", title: `Alteração solicitada por ${userName}`, message: commentNote.trim(), type: "change_request", url: "/admin/conteudos" }),
      });
      showToast("Solicitação enviada!");
    }
    setCommentNote("");
    setCommentReelId(null);
    setSaving(false);
  };

  const username = profile?.instagram ? profile.instagram.replace("@", "") : profile?.name ?? "perfil";

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", background: "#000" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-white" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ height: "100dvh", background: "#000" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none"/>
        </svg>
        <p className="text-white font-semibold">Nenhum reel disponível</p>
        <p className="text-sm text-center px-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sua agência está produzindo os primeiros reels
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-scroll scrollbar-none"
      style={{
        height: "100dvh",
        background: "#000",
        scrollSnapType: "y mandatory",
      }}
    >
      {reels.map((reel, idx) => {
        const isApproved = reel.status === "aprovado" || reel.revisions.some((r) => r.type === "approved");
        const commentCount = reel.revisions.filter((r) => r.type === "change_request").length;
        const thumb = reel.images[0] ?? "";

        return (
          <div
            key={reel.id}
            data-index={idx}
            className="relative flex-shrink-0"
            style={{
              height: "100dvh",
              width: "100%",
              scrollSnapAlign: "start",
              background: "#000",
            }}
          >
            {/* Background image/video */}
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#111" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
                  <path d="M17 12l-8-4.5v9L17 12z"/>
                </svg>
              </div>
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)" }}
            />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 px-4 flex items-center justify-between" style={{ height: 44, paddingTop: "env(safe-area-inset-top)" }}>
              <p className="text-[17px] font-bold text-white" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>Reels</p>
              <button>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </button>
            </div>

            {/* Right actions */}
            <div
              className="absolute right-3 flex flex-col items-center gap-6"
              style={{ bottom: 120 }}
            >
              {/* Like = Aprovação */}
              <button
                onClick={() => handleLike(reel)}
                disabled={isApproved}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={isApproved ? "#ED4956" : "none"} stroke={isApproved ? "#ED4956" : "white"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  {isApproved ? "✓" : "Aprovar"}
                </p>
              </button>

              {/* Comment = Solicitar alteração */}
              <button
                onClick={() => setCommentReelId(reel.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  {commentCount > 0 ? commentCount : "Alterar"}
                </p>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>Enviar</p>
              </button>

              {/* More */}
              <button className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </div>
              </button>

              {/* Profile thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ border: "2px solid white", background: "#333" }}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute left-0 right-0 px-4" style={{ bottom: 90 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "#333" }}>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  {username}
                </p>
                {!isApproved && (
                  <button
                    onClick={() => handleLike(reel)}
                    className="ml-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ border: "1px solid rgba(255,255,255,0.8)" }}
                  >
                    Aprovar
                  </button>
                )}
                {isApproved && (
                  <span className="ml-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" }}>
                    ✓ Aprovado
                  </span>
                )}
              </div>
              {reel.caption && (
                <p className="text-[13px] text-white leading-[1.4] max-w-[75%]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  {reel.caption.length > 80 ? reel.caption.slice(0, 80) + "..." : reel.caption}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <p className="text-[13px] text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Áudio original · {username}
                </p>
              </div>
            </div>

            {/* Scroll hint for last reel */}
            {idx === reels.length - 1 && reels.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                Fim dos reels
              </div>
            )}
          </div>
        );
      })}

      {/* Comment modal */}
      {commentReelId && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setCommentReelId(null); setCommentNote(""); } }}
        >
          <div
            className="w-full rounded-t-2xl p-5 pb-10"
            style={{ background: "#1c1c1e", borderTop: "0.5px solid rgba(255,255,255,0.15)" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex items-center gap-3 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <div>
                <p className="text-white font-semibold">Solicitar alteração</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>O que precisa mudar neste reel?</p>
              </div>
            </div>
            <textarea
              value={commentNote}
              onChange={(e) => setCommentNote(e.target.value)}
              placeholder="Descreva a alteração desejada..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none text-white mb-4"
              style={{ background: "#2c2c2e" }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCommentReelId(null); setCommentNote(""); }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: "#2c2c2e" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleComment}
                disabled={!commentNote.trim() || saving}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                style={{ background: "#0095F6", color: "white" }}
              >
                {saving ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed z-50 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-sm font-semibold text-white"
          style={{ bottom: 70, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
