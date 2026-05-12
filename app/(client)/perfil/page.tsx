"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Highlight = { id: string; title: string; cover: string };
type GridItem = {
  id: string;
  type: string;
  status: string;
  images: string[];
  revisions: Array<{ type: string }>;
};
type Profile = {
  name: string | null;
  instagram: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  followers: number;
  following: number;
  posts: number;
  highlights: Highlight[];
};

function formatNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"grid" | "reels" | "tagged">("grid");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, itemsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("name,instagram,avatar,bio,website,followers,following,posts,highlights")
          .eq("id", user.id)
          .single(),
        supabase
          .from("producao_items")
          .select("id,type,status,images,revisions")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profRes.data ? { ...profRes.data, highlights: profRes.data.highlights ?? [] } : null);
      setItems(
        (itemsRes.data ?? []).map((i) => ({
          ...i,
          images: i.images ?? [],
          revisions: i.revisions ?? [],
        }))
      );
      setLoading(false);
    })();
  }, []);

  const username = profile?.instagram ? profile.instagram.replace("@", "") : profile?.name ?? "perfil";
  const displayName = profile?.name ?? username;
  const highlights = profile?.highlights ?? [];
  const gridItems = items.filter((i) => i.type !== "reel");
  const reelItems = items.filter((i) => i.type === "reel");
  const shownItems = tab === "grid" ? gridItems : tab === "reels" ? reelItems : [];
  const bioLines = (profile?.bio ?? "").split("\n").filter(Boolean);
  const totalPosts = items.length || (profile?.posts ?? 0);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#000" }}>
        <div className="flex items-center justify-between px-4" style={{ height: 44, borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}>
          <div className="w-28 h-4 rounded animate-pulse" style={{ background: "#222" }} />
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-[86px] h-[86px] rounded-full animate-pulse" style={{ background: "#222" }} />
            <div className="flex gap-6 flex-1 justify-around">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-4 rounded animate-pulse" style={{ background: "#222" }} />
                  <div className="w-14 h-3 rounded animate-pulse" style={{ background: "#222" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ background: "#000", minHeight: "100dvh" }}>
      <div style={{ maxWidth: 935, margin: "0 auto" }}>

        {/* ── HEADER ── */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4"
          style={{
            background: "rgba(0,0,0,0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            height: 44,
            borderBottom: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* LEFT — username + verified badge */}
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="flex-shrink-0" style={{ opacity: 0.8 }}>
              <path d="M17 11V7a5 5 0 00-10 0v4H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-2z"/>
            </svg>
            <span className="text-[15px] font-bold text-white">{username}</span>
            {/* verified badge */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>

          {/* RIGHT — create + menu */}
          <div className="flex items-center gap-5">
            <button aria-label="Criar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ── PROFILE SECTION ── */}
        <section className="px-4 pt-4 pb-3">

          {/* TOP ROW — avatar + right content */}
          <div className="flex items-center gap-6 mb-3">

            {/* PROFILE IMAGE with gradient ring */}
            <div className="flex-shrink-0">
              <div
                className="rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)", padding: 2 }}
              >
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{ width: 80, height: 80, background: "#111", border: "2.5px solid black" }}
                >
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="white" width="38" height="38">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1 flex flex-col gap-2">

              {/* PROFESSIONAL NAME */}
              <p className="text-[13px] font-semibold text-white leading-tight">{displayName}</p>

              {/* STATS ROW */}
              <div className="flex justify-between">
                {[
                  { value: totalPosts, label: "publicações" },
                  { value: formatNum(profile?.followers ?? 0), label: "seguidores" },
                  { value: formatNum(profile?.following ?? 0), label: "seguindo" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-0">
                    <span className="text-[16px] font-bold text-white">{stat.value}</span>
                    <span className="text-[12px] text-white" style={{ opacity: 0.85 }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BIO */}
          <div className="mb-3">
            {/* CATEGORY — small gray label */}
            <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>Criador de conteúdo</span>

            {/* DISPLAY NAME / SUBTITLE */}
            <h2 className="text-[14px] font-bold text-white leading-snug mt-0.5">{displayName}</h2>

            {/* DESCRIPTION */}
            {bioLines.length > 0 && (
              <p className="text-[14px] text-white leading-[1.4] mt-0.5">
                {bioLines.map((line, i) => (
                  <span key={i}>{line}{i < bioLines.length - 1 && <br />}</span>
                ))}
              </p>
            )}

            {/* LINK */}
            {profile?.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E0F1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                <span className="text-[13px] font-semibold" style={{ color: "#E0F1FF" }}>{profile.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-[7px] rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "#363636" }}
            >
              Contato
            </button>
            <button
              className="flex-1 py-[7px] rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "#363636" }}
            >
              Seguindo
            </button>
            <button
              className="py-[7px] px-3 rounded-lg flex items-center justify-center"
              style={{ background: "#363636" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ── HIGHLIGHTS ── */}
        <section
          className="flex gap-4 px-3 pt-1 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* NEW highlight button */}
          <div className="flex flex-col items-center gap-[5px] flex-shrink-0">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 66, height: 66, background: "#262626", border: "1px solid #363636" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span className="text-[11px] text-white text-center" style={{ maxWidth: 70 }}>Novo</span>
          </div>

          {highlights.map((hl) => (
            <div key={hl.id} className="flex flex-col items-center gap-[5px] flex-shrink-0">
              {/* HIGHLIGHT IMAGE WRAPPER */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)", padding: 2 }}
              >
                <div
                  className="rounded-full overflow-hidden"
                  style={{ width: 62, height: 62, border: "2px solid black", background: "#111" }}
                >
                  {hl.cover ? (
                    <img src={hl.cover} alt={hl.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base font-bold text-white">
                      {hl.title.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-white text-center truncate" style={{ maxWidth: 70 }}>{hl.title}</span>
            </div>
          ))}
        </section>

        {/* ── TABS ── */}
        <section
          className="flex"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.15)", borderBottom: "0.5px solid rgba(255,255,255,0.15)" }}
        >
          {/* POSTS TAB */}
          <button
            onClick={() => setTab("grid")}
            className="flex-1 flex items-center justify-center py-[11px]"
            style={{ borderBottom: tab === "grid" ? "1.5px solid white" : "1.5px solid transparent" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "grid" ? "white" : "none"} stroke={tab === "grid" ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>

          {/* REELS TAB */}
          <button
            onClick={() => setTab("reels")}
            className="flex-1 flex items-center justify-center py-[11px]"
            style={{ borderBottom: tab === "reels" ? "1.5px solid white" : "1.5px solid transparent" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "reels" ? "white" : "none"} stroke={tab === "reels" ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M17 12l-8-4.5v9L17 12z" fill={tab === "reels" ? "white" : "rgba(255,255,255,0.4)"} stroke="none"/>
            </svg>
          </button>

          {/* TAGGED TAB */}
          <button
            onClick={() => setTab("tagged")}
            className="flex-1 flex items-center justify-center py-[11px]"
            style={{ borderBottom: tab === "tagged" ? "1.5px solid white" : "1.5px solid transparent" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === "tagged" ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5"/>
            </svg>
          </button>
        </section>

        {/* ── FEED GRID ── */}
        <section>
          {tab === "tagged" ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              </svg>
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma marcação ainda</p>
            </div>
          ) : shownItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round">
                {tab === "grid"
                  ? <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>
                  : <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none"/></>
                }
              </svg>
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Nenhum {tab === "grid" ? "post" : "reel"} ainda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3" style={{ gap: 2 }}>
              {shownItems.map((item) => {
                const thumb = item.images[0] ?? "";
                const isApproved = item.status === "aprovado" || item.revisions.some((r) => r.type === "approved");
                const hasRevision = item.revisions.some((r) => r.type === "change_request");
                const href = item.type === "reel" ? `/reels/${item.id}` : `/post/${item.id}`;
                return (
                  <Link key={item.id} href={href}>
                    <div className="relative" style={{ aspectRatio: "4/5", background: "#111" }}>
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                            {item.type === "reel"
                              ? <path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none"/>
                              : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>
                            }
                          </svg>
                        </div>
                      )}

                      {item.images.length > 1 && (
                        <div className="absolute top-2 right-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M2 6h14v14H2z" opacity=".3"/><path d="M8 2h14v14H8z"/>
                          </svg>
                        </div>
                      )}
                      {item.type === "reel" && (
                        <div className="absolute top-2 right-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M17 12l-8-4.5v9L17 12z"/>
                          </svg>
                        </div>
                      )}
                      {isApproved && (
                        <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        </div>
                      )}
                      {hasRevision && !isApproved && (
                        <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <div className="h-20" />
      </div>
    </main>
  );
}
