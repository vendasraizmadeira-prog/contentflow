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

function timeAgo(iso: string): string {
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
  const [tab, setTab] = useState<"preview" | "descricao">("preview");
  const [showModal, setShowModal] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

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
        setCaptionDraft(item.caption ?? "");
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

  const notifyAdmins = async (title: string, message: string, type: string, url: string) => {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole: "admin", title, message, type, url }),
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
      showToast("Post aprovado!");
      notifyAdmins(
        `Post aprovado por ${userName}`,
        content.type === "carousel" ? "Post carrossel aprovado" : "Post aprovado",
        "approved",
        `/admin/conteudos`
      );
    }
    setSaving(false);
  };

  const handleChangeRequest = async () => {
    if (!content || !changeNote.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();

    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "change_request",
      note: changeNote.trim(),
      author: userName,
      author_id: userId,
      slide: selectedSlide,
      status: "pending",
    };

    const newRevisions = [...content.revisions, revision];

    const { error } = await supabase
      .from("producao_items")
      .update({ revisions: newRevisions })
      .eq("id", content.id);

    if (!error) {
      setContent({ ...content, revisions: newRevisions });
      const slideInfo = selectedSlide !== null ? ` (Slide ${selectedSlide + 1})` : "";
      notifyAdmins(
        `Alteração solicitada por ${userName}`,
        `${changeNote.trim()}${slideInfo}`,
        "change_request",
        `/admin/conteudos`
      );
      showToast("Solicitação enviada!");
    }
    setChangeNote("");
    setSelectedSlide(null);
    setShowModal(false);
    setSaving(false);
  };

  const handleCancelRequest = async (revisionId: string) => {
    if (!content || saving) return;
    setSaving(true);
    const supabase = createClient();

    const newRevisions = content.revisions.map((r) =>
      r.id === revisionId ? { ...r, status: "cancelled" as const } : r
    );

    const { error } = await supabase
      .from("producao_items")
      .update({ revisions: newRevisions })
      .eq("id", content.id);

    if (!error) {
      setContent({ ...content, revisions: newRevisions });
      showToast("Solicitação cancelada");
    }
    setSaving(false);
  };

  const handleSaveCaption = async () => {
    if (!content || saving) return;
    setSaving(true);
    const supabase = createClient();

    const revision: Revision = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "caption_edit",
      note: "Descrição editada",
      author: userName,
      author_id: userId,
    };
    const newRevisions = [...content.revisions, revision];

    const { error } = await supabase
      .from("producao_items")
      .update({ caption: captionDraft, revisions: newRevisions })
      .eq("id", content.id);

    if (!error) {
      setContent({ ...content, caption: captionDraft, revisions: newRevisions });
      setEditingCaption(false);
      showToast("Descrição salva!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0F" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#D4FF3F", borderTopColor: "transparent" }} />
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

  const images = content.images.length > 0 ? content.images : [];
  const isCarousel = images.length > 1;
  const handle = profile?.instagram ? profile.instagram.replace("@", "") : (profile?.name ?? "");
  const avatar = profile?.avatar ?? "";
  const st = statusLabels[content.status] ?? statusLabels.aguardando;

  const pendingRequests = content.revisions.filter(
    (r) => r.type === "change_request" && r.status === "pending" && r.author_id === userId
  );
  const isApproved = content.status === "aprovado";
  const canApprove = content.status === "em_revisao" && !isApproved;

  const ImageSlider = ({ maxWidth }: { maxWidth?: number }) => (
    <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", maxWidth }}>
      {images.length > 0 ? (
        <img src={images[slide]} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: "#0F0F1E" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      )}
      {isCarousel && (
        <>
          <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => setSlide(Math.min(images.length - 1, slide + 1))} disabled={slide === images.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>
            {slide + 1}/{images.length}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_: string, i: number) => (
              <div key={i} onClick={() => setSlide(i)} className="rounded-full cursor-pointer transition-all" style={{ width: i === slide ? 16 : 6, height: 6, background: i === slide ? "#fff" : "rgba(255,255,255,0.45)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const RevisionHistory = () => {
    const relevant = [...content.revisions].reverse();
    if (relevant.length === 0) return null;
    return (
      <div className="flex flex-col gap-2 mt-4">
        <p className="text-xs font-semibold" style={{ color: "#6B7280" }}>HISTÓRICO</p>
        {relevant.map((r) => {
          const isReq = r.type === "change_request";
          const isCancelled = r.status === "cancelled";
          const isPending = r.status === "pending";
          const canCancel = isReq && isPending && r.author_id === userId;
          const iconColor = r.type === "approved" ? "#22C55E" : r.type === "caption_edit" ? "#7B4DFF" : isCancelled ? "#4B5563" : "#FBBF24";
          return (
            <div key={r.id} className="rounded-xl p-3 flex items-start gap-3" style={{ background: "#0B0B0F", border: "1px solid #22223A", opacity: isCancelled ? 0.5 : 1 }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${iconColor}20` }}>
                {r.type === "approved" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                ) : r.type === "caption_edit" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold">{r.note}</p>
                  {isReq && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{
                      background: isPending ? "rgba(251,191,36,0.15)" : isCancelled ? "rgba(107,114,128,0.15)" : "rgba(34,197,94,0.15)",
                      color: isPending ? "#FBBF24" : isCancelled ? "#6B7280" : "#22C55E",
                    }}>
                      {isPending ? "Pendente" : isCancelled ? "Cancelado" : "Resolvido"}
                    </span>
                  )}
                  {r.slide !== null && r.slide !== undefined && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "rgba(123,77,255,0.15)", color: "#7B4DFF" }}>
                      Slide {r.slide + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{r.author} • {timeAgo(r.timestamp)}</p>
              </div>
              {canCancel && (
                <button onClick={() => handleCancelRequest(r.id)} className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0" style={{ border: "1px solid #22223A", color: "#9CA3AF" }}>
                  Cancelar
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const ActionButtons = () => {
    if (isApproved) {
      return (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <p className="font-semibold text-sm" style={{ color: "#22C55E" }}>Conteúdo aprovado!</p>
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
        <button onClick={() => setShowModal(true)} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-base active:scale-[0.97] transition-all disabled:opacity-60" style={{ border: "1px solid #22223A", color: "#fff" }}>
          Solicitar alteração
        </button>
        {pendingRequests.length > 0 && (
          <p className="text-xs text-center" style={{ color: "#FBBF24" }}>
            {pendingRequests.length} solicitação(ões) pendente(s) — veja na aba Descrição
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
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{isCarousel ? "Post Carrossel" : content.type === "reel" ? "Reels" : "Post"}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden">
        {/* Instagram preview section */}
        <div style={{ background: "#0F0F1E" }}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            {avatar ? (
              <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#22223A", color: "#D4FF3F" }}>
                {handle.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold">{handle}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Patrocinado</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </div>

          <ImageSlider />

          <div className="px-4 py-3">
            <div className="flex items-center gap-4 mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" className="ml-auto"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            </div>
            {content.caption && (
              <p className="text-xs">
                <span className="font-semibold">{handle} </span>
                <span style={{ color: "#D1D5DB" }}>{content.caption.slice(0, 90)}{content.caption.length > 90 ? "..." : ""}</span>
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid #1E1E2A" }}>
          {(["preview", "descricao"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 text-xs font-medium" style={{ color: tab === t ? "#D4FF3F" : "#6B7280", borderBottom: tab === t ? "2px solid #D4FF3F" : "2px solid transparent" }}>
              {t === "preview" ? "Preview" : "Descrição"}
            </button>
          ))}
        </div>

        {tab === "descricao" && (
          <div className="p-4">
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: "#6B7280" }}>DESCRIÇÃO / LEGENDA</p>
                {!editingCaption && (
                  <button onClick={() => { setEditingCaption(true); setCaptionDraft(content.caption ?? ""); }} className="text-xs" style={{ color: "#D4FF3F" }}>Editar</button>
                )}
              </div>
              {editingCaption ? (
                <>
                  <textarea
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none mb-3"
                    style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCaption(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ border: "1px solid #22223A", color: "#9CA3AF" }}>Cancelar</button>
                    <button onClick={handleSaveCaption} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Salvar</button>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: content.caption ? "#D1D5DB" : "#4B5563" }}>
                  {content.caption || "Sem descrição"}
                </p>
              )}
            </div>
            <RevisionHistory />
          </div>
        )}

        {/* Sticky action buttons at bottom */}
        <div className="sticky bottom-20 left-0 right-0 px-4 pb-4 pt-3 md:hidden" style={{ background: "linear-gradient(to top, #0B0B0F 80%, transparent)" }}>
          <ActionButtons />
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: "#6B7280" }}>PREVIEW INSTAGRAM</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #22223A", maxWidth: 380 }}>
              <div className="flex items-center gap-2 p-3">
                {avatar ? (
                  <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#22223A", color: "#D4FF3F" }}>{handle.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <p className="text-xs font-semibold">{handle}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>Patrocinado</p>
                </div>
              </div>
              <ImageSlider maxWidth={380} />
              <div className="p-3">
                {content.caption && (
                  <p className="text-xs">{handle} <span style={{ color: "#D1D5DB" }}>{content.caption.slice(0, 80)}{content.caption.length > 80 ? "..." : ""}</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Descrição / Legenda</h3>
                {!editingCaption && (
                  <button onClick={() => { setEditingCaption(true); setCaptionDraft(content.caption ?? ""); }} className="text-xs" style={{ color: "#D4FF3F" }}>Editar</button>
                )}
              </div>
              {editingCaption ? (
                <>
                  <textarea
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none mb-3"
                    style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCaption(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ border: "1px solid #22223A", color: "#9CA3AF" }}>Cancelar</button>
                    <button onClick={handleSaveCaption} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-bold disabled:opacity-60" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>Salvar</button>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: content.caption ? "#D1D5DB" : "#4B5563" }}>
                  {content.caption || "Sem descrição"}
                </p>
              )}
            </div>

            <ActionButtons />

            {content.revisions.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                <h3 className="text-sm font-semibold mb-3">Histórico</h3>
                <RevisionHistory />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change request modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4 md:hidden" style={{ background: "#22223A" }}/>
            <h3 className="font-bold mb-1">Solicitar alteração</h3>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>Descreva o que precisa ser alterado</p>

            {isCarousel && (
              <div className="mb-4">
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>SLIDE (OPCIONAL)</label>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setSelectedSlide(null)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: selectedSlide === null ? "rgba(212,255,63,0.15)" : "#0B0B0F", color: selectedSlide === null ? "#D4FF3F" : "#6B7280", border: `1px solid ${selectedSlide === null ? "rgba(212,255,63,0.3)" : "#22223A"}` }}>
                    Geral
                  </button>
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setSelectedSlide(i)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: selectedSlide === i ? "rgba(212,255,63,0.15)" : "#0B0B0F", color: selectedSlide === i ? "#D4FF3F" : "#6B7280", border: `1px solid ${selectedSlide === i ? "rgba(212,255,63,0.3)" : "#22223A"}` }}>
                      Slide {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Ex: Trocar a cor do fundo, ajustar o texto..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-2xl text-sm resize-none outline-none mb-4"
              style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setChangeNote(""); setSelectedSlide(null); }} className="flex-1 py-3 rounded-2xl text-sm" style={{ border: "1px solid #22223A", color: "#9CA3AF" }}>Cancelar</button>
              <button onClick={handleChangeRequest} disabled={!changeNote.trim() || saving} className="flex-1 py-3 rounded-2xl text-sm font-bold disabled:opacity-40" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                {saving ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 px-4 py-3 rounded-2xl text-sm font-semibold text-center" style={{ background: "#10B981", color: "#fff" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
