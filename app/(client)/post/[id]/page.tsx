"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Revision = {
  id: string;
  timestamp: string;
  type: "change_request" | "approved" | "caption_edit";
  note: string;
  author: string;
  author_id: string;
  slide?: number | null;
  status?: "pending" | "resolved" | "cancelled";
};

type Content = {
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
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "agora";
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [content, setContent] = useState<Content | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentNote, setCommentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: item }, { data: prof }] = await Promise.all([
        supabase
          .from("producao_items")
          .select("id,type,status,images,caption,revisions,scheduled_date,created_at")
          .eq("id", id)
          .eq("client_id", user.id)
          .single(),
        supabase.from("profiles").select("id,name,instagram,avatar").eq("id", user.id).single(),
      ]);

      if (item) {
        setContent({ ...item, images: item.images ?? [], revisions: item.revisions ?? [] });
      }
      if (prof) {
        setProfile(prof);
        setUserName(prof.name ?? "");
      }
      setLoading(false);
    })();
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const notifyAdmins = (title: string, message: string, type: string) => {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole: "admin", title, message, type, url: "/admin/conteudos" }),
    });
  };

  const handleApprove = async () => {
    if (!content || saving || isApproved) return;
    setSaving(true);
    const supabase = createClient();
    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "approved",
      note: "Post aprovado",
      author: userName,
      author_id: userId,
    };
    const newRevisions = [...content.revisions, revision];
    const { error } = await supabase
      .from("producao_items")
      .update({ status: "aprovado", revisions: newRevisions })
      .eq("id", content.id);

    if (!error) {
      setContent({ ...content, status: "aprovado", revisions: newRevisions });
      showToast("Post aprovado! ✓");
      notifyAdmins(`Post aprovado por ${userName}`, "O cliente aprovou o conteúdo", "approved");
    }
    setSaving(false);
  };

  const handleComment = async () => {
    if (!content || !commentNote.trim() || saving) return;
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
    const newRevisions = [...content.revisions, revision];
    const { error } = await supabase
      .from("producao_items")
      .update({ revisions: newRevisions })
      .eq("id", content.id);

    if (!error) {
      setContent({ ...content, revisions: newRevisions });
      notifyAdmins(`Alteração solicitada por ${userName}`, commentNote.trim(), "change_request");
      showToast("Solicitação enviada!");
    }
    setCommentNote("");
    setShowComments(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-white" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#000" }}>
        <p className="text-white font-semibold">Conteúdo não encontrado</p>
        <button onClick={() => router.back()} className="text-sm" style={{ color: "#0095F6" }}>Voltar</button>
      </div>
    );
  }

  const images = content.images;
  const isCarousel = images.length > 1;
  const isApproved = content.status === "aprovado" || content.revisions.some((r) => r.type === "approved");
  const username = profile?.instagram ? profile.instagram.replace("@", "") : profile?.name ?? "perfil";
  const changeRequests = content.revisions.filter((r) => r.type === "change_request");
  const approvalEntry = content.revisions.find((r) => r.type === "approved");

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4"
        style={{
          height: 44,
          background: "rgba(0,0,0,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <button onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-[15px] font-bold text-white">
          {isCarousel ? "Carrossel" : content.type === "reel" ? "Reel" : "Publicação"}
        </p>
        <button>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
          </svg>
        </button>
      </div>

      <div className="max-w-[468px] mx-auto">
        {/* Post header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="rounded-full flex-shrink-0"
            style={{ padding: 2, background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" }}
          >
            <div className="rounded-full overflow-hidden" style={{ width: 32, height: 32, background: "#111", border: "2px solid black" }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-white">{username}</p>
            {content.scheduled_date && (
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {new Date(content.scheduled_date + "T12:00:00").toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <button style={{ color: "white" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="relative" style={{ aspectRatio: "1/1", background: "#111" }}>
          {images.length > 0 ? (
            <img src={images[slide]} alt="" className="w-full h-full object-cover select-none" draggable={false} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
              </svg>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Imagem em processamento</p>
            </div>
          )}

          {isCarousel && (
            <>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setSlide(i)}
                    className="rounded-full cursor-pointer transition-all"
                    style={{ width: i === slide ? 6 : 5, height: i === slide ? 6 : 5, background: i === slide ? "white" : "rgba(255,255,255,0.5)" }}
                  />
                ))}
              </div>
              {slide > 0 && (
                <button onClick={() => setSlide((s) => Math.max(0, s - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}
              {slide < images.length - 1 && (
                <button onClick={() => setSlide((s) => Math.min(images.length - 1, s + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
                {slide + 1}/{images.length}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-4 mb-2">
            {/* Like = Aprovação */}
            <button
              onClick={handleApprove}
              disabled={isApproved || saving}
              className="transition-transform active:scale-[1.3]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={isApproved ? "#ED4956" : "none"} stroke={isApproved ? "#ED4956" : "white"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            {/* Comment = Solicitar alteração */}
            <button onClick={() => setShowComments(true)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </button>

            {/* Share */}
            <button>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>

            {/* Save */}
            <button className="ml-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </button>
          </div>

          {/* Approval status */}
          {isApproved ? (
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ED4956">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              <p className="text-[13px] font-semibold text-white">Aprovado</p>
              {approvalEntry && (
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {timeAgo(approvalEntry.timestamp)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] font-semibold text-white mb-2">
              Toque em ❤️ para aprovar este conteúdo
            </p>
          )}

          {/* Caption */}
          {content.caption && (
            <p className="text-[13px] text-white leading-[1.4] mb-2">
              <span className="font-semibold">{username} </span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{content.caption}</span>
            </p>
          )}

          {/* Change requests */}
          {changeRequests.length > 0 && (
            <button onClick={() => setShowComments(true)} className="w-full text-left">
              <p className="text-[13px] mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                Ver {changeRequests.length} solicitaç{changeRequests.length === 1 ? "ão" : "ões"} de alteração
              </p>
            </button>
          )}

          {/* Timestamp */}
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
            {new Date(content.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "0.5px", background: "rgba(255,255,255,0.1)", margin: "0 0 8px" }} />

        {/* Add comment row (always visible) */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#333" }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            )}
          </div>
          <button
            className="flex-1 text-left text-sm py-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onClick={() => setShowComments(true)}
          >
            Adicionar um comentário / solicitar alteração...
          </button>
        </div>

        <div className="h-16" />
      </div>

      {/* Comments / Revision Sheet */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowComments(false); }}
        >
          <div
            className="rounded-t-2xl flex flex-col"
            style={{ background: "#000", borderTop: "0.5px solid rgba(255,255,255,0.15)", maxHeight: "85vh" }}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}>
              <button onClick={() => setShowComments(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <p className="text-[15px] font-bold text-white">Comentários / Alterações</p>
              <div style={{ width: 24 }} />
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {changeRequests.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Nenhuma solicitação ainda
                </p>
              ) : (
                changeRequests.map((r) => (
                  <div key={r.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#333" }}>
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                          {r.author.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-white leading-[1.4]">
                        <span className="font-semibold">{r.author} </span>
                        {r.note}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{timeAgo(r.timestamp)}</p>
                        {r.status === "pending" && (
                          <span className="text-[11px] font-semibold" style={{ color: "#fbbf24" }}>Pendente</span>
                        )}
                        {r.status === "resolved" && (
                          <span className="text-[11px] font-semibold" style={{ color: "#4ade80" }}>Resolvido</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.12)" }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#333" }}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
              </div>
              <input
                value={commentNote}
                onChange={(e) => setCommentNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Solicitar alteração..."
                className="flex-1 py-2 text-sm outline-none bg-transparent text-white placeholder:text-[rgba(255,255,255,0.35)]"
                autoFocus
              />
              <button
                onClick={handleComment}
                disabled={!commentNote.trim() || saving}
                className="text-sm font-bold disabled:opacity-30"
                style={{ color: "#0095F6" }}
              >
                {saving ? "..." : "Enviar"}
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
