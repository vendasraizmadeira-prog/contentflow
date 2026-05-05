"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Highlight = { id: string; title: string; cover: string };
type Revision = { id: string; type: string; note: string; author: string; author_id: string; timestamp: string; status?: string; slide?: number | null };
type FeedItem = {
  id: string;
  type: string;
  status: string;
  images: string[];
  caption: string | null;
  revisions: Revision[];
  scheduled_date: string | null;
  created_at: string;
};
type Profile = {
  id: string;
  name: string | null;
  instagram: string | null;
  avatar: string | null;
  highlights: Highlight[];
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
  const d = Math.floor(diff / 86400000);
  return `${d} ${d === 1 ? "dia" : "dias"}`;
}

function formatFollowers(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function PostCard({
  item,
  profile,
  userId,
  userName,
  onLike,
  onCommentOpen,
}: {
  item: FeedItem;
  profile: Profile;
  userId: string;
  userName: string;
  onLike: (id: string) => void;
  onCommentOpen: (id: string) => void;
}) {
  const [slide, setSlide] = useState(0);
  const isApproved = item.status === "aprovado" || item.revisions.some((r) => r.type === "approved");
  const commentCount = item.revisions.filter((r) => r.type === "change_request").length;
  const isCarousel = item.images.length > 1;
  const handle = item.type === "reel"
    ? "reel"
    : profile.instagram
      ? profile.instagram.replace("@", "")
      : profile.name ?? "perfil";
  const username = profile.instagram ? profile.instagram.replace("@", "") : profile.name ?? "perfil";

  const handleDoubleTap = () => {
    if (!isApproved) onLike(item.id);
  };

  return (
    <article style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)", paddingBottom: 8, marginBottom: 4 }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className="rounded-full flex-shrink-0"
          style={{
            padding: 2,
            background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)",
          }}
        >
          <div className="rounded-full overflow-hidden" style={{ width: 32, height: 32, background: "#111" }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white leading-tight">{username}</p>
          {item.scheduled_date && (
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {new Date(item.scheduled_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </p>
          )}
        </div>
        <button style={{ color: "white", padding: "4px 2px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Image / Carousel */}
      <div className="relative" style={{ aspectRatio: "1/1", background: "#111" }} onDoubleClick={handleDoubleTap}>
        {item.images.length > 0 ? (
          <img
            src={item.images[slide]}
            alt=""
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: "#111" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
              {item.type === "reel"
                ? <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none"/></>
                : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>
              }
            </svg>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {item.type === "reel" ? "Reel em processamento" : "Imagem em processamento"}
            </p>
          </div>
        )}

        {/* Carousel indicators */}
        {isCarousel && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {item.images.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setSlide(i)}
                  className="rounded-full cursor-pointer transition-all"
                  style={{
                    width: i === slide ? 6 : 5,
                    height: i === slide ? 6 : 5,
                    background: i === slide ? "white" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
            {slide > 0 && (
              <button
                onClick={() => setSlide((s) => Math.max(0, s - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}
            {slide < item.images.length - 1 && (
              <button
                onClick={() => setSlide((s) => Math.min(item.images.length - 1, s + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            )}
          </>
        )}

        {/* Status badge */}
        {item.status === "agendado" && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(0,0,0,0.7)", color: "#818CF8" }}>
            Agendado
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-4 mb-2">
          {/* Like = Aprovação */}
          <button
            onClick={() => onLike(item.id)}
            className="transition-transform active:scale-[1.3]"
            disabled={isApproved}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={isApproved ? "#ED4956" : "none"} stroke={isApproved ? "#ED4956" : "white"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {/* Comment = Solicitar alteração */}
          <button onClick={() => onCommentOpen(item.id)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>

          {/* Share (decorativo) */}
          <button>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

          {/* Save (decorativo) */}
          <button className="ml-auto">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </div>

        {/* Status/likes info */}
        <div className="mb-1">
          {isApproved ? (
            <p className="text-[13px] font-semibold text-white">✓ Aprovado</p>
          ) : (
            <p className="text-[13px] text-white">
              <span className="font-semibold">Toque no ❤️ para aprovar</span>
            </p>
          )}
        </div>

        {/* Caption */}
        {item.caption && (
          <p className="text-[13px] text-white leading-[1.4] mb-1">
            <span className="font-semibold">{username} </span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>
              {item.caption.length > 120 ? item.caption.slice(0, 120) + "... " : item.caption}
              {item.caption.length > 120 && (
                <Link href={`/post/${item.id}`}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>mais</span>
                </Link>
              )}
            </span>
          </p>
        )}

        {/* Comments count */}
        {commentCount > 0 && (
          <button onClick={() => onCommentOpen(item.id)}>
            <p className="text-[13px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Ver {commentCount} solicitaç{commentCount === 1 ? "ão" : "ões"} de alteração
            </p>
          </button>
        )}

        {/* Time */}
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
          {timeAgo(item.created_at)} atrás
        </p>
      </div>
    </article>
  );
}

export default function Feed() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  // Comment modal state
  const [commentItemId, setCommentItemId] = useState<string | null>(null);
  const [commentNote, setCommentNote] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [profRes, itemsRes, notifRes] = await Promise.all([
        supabase.from("profiles").select("id,name,instagram,avatar,highlights,followers,following").eq("id", user.id).single(),
        supabase.from("producao_items")
          .select("id,type,status,images,caption,revisions,scheduled_date,created_at")
          .eq("client_id", user.id)
          .in("status", ["em_revisao", "aprovado", "agendado"])
          .order("created_at", { ascending: false }),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);

      setProfile(profRes.data ? { ...profRes.data, highlights: profRes.data.highlights ?? [] } : null);
      setUserName(profRes.data?.name ?? "");
      setItems(
        (itemsRes.data ?? []).map((i) => ({
          ...i,
          revisions: i.revisions ?? [],
          images: i.images ?? [],
        }))
      );
      setUnread(notifRes.count ?? 0);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleLike = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.status === "aprovado" || item.revisions.some((r) => r.type === "approved")) return;

    const supabase = createClient();
    const revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "approved",
      note: "Post aprovado",
      author: userName,
      author_id: userId,
    };
    const newRevisions = [...item.revisions, revision];

    const { error } = await supabase
      .from("producao_items")
      .update({ status: "aprovado", revisions: newRevisions })
      .eq("id", itemId);

    if (!error) {
      setItems((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, status: "aprovado", revisions: newRevisions } : i)
      );
      showToast("Post aprovado!");
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "admin",
          title: `Post aprovado por ${userName}`,
          message: "O cliente aprovou o conteúdo",
          type: "approved",
          url: "/admin/conteudos",
        }),
      });
    }
  };

  const handleComment = async () => {
    if (!commentItemId || !commentNote.trim() || commentSaving) return;
    const item = items.find((i) => i.id === commentItemId);
    if (!item) return;

    setCommentSaving(true);
    const supabase = createClient();
    const revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "change_request",
      note: commentNote.trim(),
      author: userName,
      author_id: userId,
      status: "pending",
    };
    const newRevisions = [...item.revisions, revision];

    const { error } = await supabase
      .from("producao_items")
      .update({ revisions: newRevisions })
      .eq("id", commentItemId);

    if (!error) {
      setItems((prev) =>
        prev.map((i) => i.id === commentItemId ? { ...i, revisions: newRevisions } : i)
      );
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "admin",
          title: `Alteração solicitada por ${userName}`,
          message: commentNote.trim(),
          type: "change_request",
          url: "/admin/conteudos",
        }),
      });
      showToast("Solicitação enviada!");
    }
    setCommentNote("");
    setCommentItemId(null);
    setCommentSaving(false);
  };

  const highlights: Highlight[] = profile?.highlights ?? [];
  const username = profile?.instagram ? profile.instagram.replace("@", "") : profile?.name ?? "perfil";

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {/* Top bar — mobile */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:hidden"
        style={{
          background: "rgba(0,0,0,0.94)",
          borderBottom: "0.5px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          height: 44,
        }}
      >
        <span className="text-xl font-bold italic text-white" style={{ fontFamily: "Georgia, serif" }}>
          Instagram
        </span>
        <div className="flex items-center gap-4">
          <Link href="/notificacoes" className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ background: "#FF3040", color: "white", fontSize: 9 }}>
                {unread}
              </span>
            )}
          </Link>
          <button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-[468px] mx-auto md:pt-4">
        {/* Stories / Highlights */}
        {(loading || highlights.length > 0) && (
          <div
            className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-none"
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)" }}
          >
            {loading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: "#222" }} />
                    <div className="w-12 h-2 rounded animate-pulse" style={{ background: "#222" }} />
                  </div>
                ))
              : highlights.map((hl) => (
                  <Link key={hl.id} href="/perfil" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className="rounded-full p-[2px] flex-shrink-0"
                      style={{ background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" }}
                    >
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden" style={{ border: "2px solid black", background: "#111" }}>
                        {hl.cover ? (
                          <img src={hl.cover} alt={hl.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                            {hl.title.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white text-center truncate w-16">{hl.title}</p>
                  </Link>
                ))}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col gap-0">
            {[1, 2].map((i) => (
              <div key={i} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.1)", paddingBottom: 8, marginBottom: 4 }}>
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: "#222" }} />
                  <div className="w-24 h-3 rounded animate-pulse" style={{ background: "#222" }} />
                </div>
                <div className="animate-pulse" style={{ aspectRatio: "1/1", background: "#222" }} />
                <div className="px-3 pt-3 flex flex-col gap-2">
                  <div className="w-16 h-3 rounded animate-pulse" style={{ background: "#222" }} />
                  <div className="w-48 h-3 rounded animate-pulse" style={{ background: "#222" }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-white font-semibold">Nenhum conteúdo ainda</p>
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              Sua agência está preparando os primeiros conteúdos
            </p>
          </div>
        ) : (
          profile && items.map((item) => (
            <PostCard
              key={item.id}
              item={item}
              profile={profile}
              userId={userId}
              userName={userName}
              onLike={handleLike}
              onCommentOpen={(id) => setCommentItemId(id)}
            />
          ))
        )}

        {/* Bottom padding */}
        <div className="h-8" />
      </div>

      {/* Comment modal */}
      {commentItemId && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setCommentItemId(null); setCommentNote(""); } }}
        >
          <div
            className="w-full max-w-[468px] rounded-t-3xl p-5 pb-10"
            style={{ background: "#262626", borderTop: "0.5px solid rgba(255,255,255,0.15)" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="flex items-center gap-3 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <div>
                <p className="text-white font-semibold">Solicitar alteração</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Descreva o que precisa mudar</p>
              </div>
            </div>
            <textarea
              value={commentNote}
              onChange={(e) => setCommentNote(e.target.value)}
              placeholder="Ex: Mudar a cor do texto, ajustar o logo..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none text-white mb-4"
              style={{ background: "#363636", border: "none" }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setCommentItemId(null); setCommentNote(""); }}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: "#363636" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleComment}
                disabled={!commentNote.trim() || commentSaving}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-40"
                style={{ background: "#0095F6", color: "white" }}
              >
                {commentSaving ? "Enviando..." : "Enviar"}
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
