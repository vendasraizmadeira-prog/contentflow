"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"grid" | "reels">("grid");

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
  const highlights = profile?.highlights ?? [];
  const gridItems = items.filter((i) => i.type !== "reel");
  const reelItems = items.filter((i) => i.type === "reel");
  const shownItems = tab === "grid" ? gridItems : reelItems;
  const bioLines = (profile?.bio ?? "").split("\n");

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "#000" }}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}>
          <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#222" }} />
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full animate-pulse" style={{ background: "#222" }} />
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-4 rounded animate-pulse" style={{ background: "#222" }} />
                  <div className="w-12 h-3 rounded animate-pulse" style={{ background: "#222" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4"
        style={{
          background: "rgba(0,0,0,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          height: 44,
          borderBottom: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <button onClick={() => router.back()} className="md:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center md:text-left md:pl-0">
          <p className="text-[15px] font-bold text-white">{username}</p>
        </div>
        <div className="flex items-center gap-5">
          <button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-[935px] mx-auto">
        {/* Profile header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-6 mb-3">
            {/* Avatar */}
            <div
              className="rounded-full p-[3px] flex-shrink-0"
              style={{ background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" }}
            >
              <div
                className="rounded-full overflow-hidden flex items-center justify-center"
                style={{ width: 77, height: 77, background: "#111", border: "3px solid black" }}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-1 justify-around">
              {[
                { value: items.length || (profile?.posts ?? 0), label: "publicações" },
                { value: formatNum(profile?.followers ?? 0), label: "seguidores" },
                { value: formatNum(profile?.following ?? 0), label: "seguindo" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-0.5">
                  <span className="text-[17px] font-bold text-white">{stat.value}</span>
                  <span className="text-[12px] text-white">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Name + Bio */}
          <div className="mb-2">
            <p className="text-[13px] font-semibold text-white leading-tight">{profile?.name ?? username}</p>
            {profile?.bio && (
              <div className="mt-1">
                {bioLines.map((line, i) => (
                  <p key={i} className="text-[13px] text-white leading-[1.4]">{line || " "}</p>
                ))}
              </div>
            )}
            {profile?.website && (
              <p className="text-[13px] font-semibold mt-1" style={{ color: "#E0F1FF" }}>
                {profile.website}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
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
              className="py-[7px] px-3 rounded-lg"
              style={{ background: "#363636" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div
            className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-none"
            style={{ borderTop: "0.5px solid rgba(255,255,255,0.12)", borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            {highlights.map((hl) => (
              <div key={hl.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className="rounded-full p-[2px]"
                  style={{ background: "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)" }}
                >
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ width: 56, height: 56, border: "2px solid black", background: "#111" }}
                  >
                    {hl.cover ? (
                      <img src={hl.cover} alt={hl.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                        {hl.title.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-white text-center truncate" style={{ maxWidth: 64 }}>{hl.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.12)" }}>
          <button
            onClick={() => setTab("grid")}
            className="flex-1 flex items-center justify-center py-3"
            style={{ borderBottom: tab === "grid" ? "1px solid white" : "none" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "grid" ? "white" : "none"} stroke={tab === "grid" ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setTab("reels")}
            className="flex-1 flex items-center justify-center py-3"
            style={{ borderBottom: tab === "reels" ? "1px solid white" : "none" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === "reels" ? "white" : "none"} stroke={tab === "reels" ? "white" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M17 12l-8-4.5v9L17 12z" fill={tab === "reels" ? "black" : "rgba(255,255,255,0.4)"} stroke="none" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        {shownItems.length === 0 ? (
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
          <div className="grid grid-cols-3 gap-[1px]">
            {shownItems.map((item) => {
              const thumb = item.images[0] ?? "";
              const isApproved = item.status === "aprovado" || item.revisions.some((r) => r.type === "approved");
              const hasRevision = item.revisions.some((r) => r.type === "change_request");
              const href = item.type === "reel" ? `/reels/${item.id}` : `/post/${item.id}`;
              return (
                <Link key={item.id} href={href}>
                  <div className="relative" style={{ aspectRatio: "1/1", background: "#111" }}>
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                          {item.type === "reel"
                            ? <path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none" />
                            : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>
                          }
                        </svg>
                      </div>
                    )}

                    {/* Carrossel indicator */}
                    {item.images.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M2 6h14v14H2z" opacity=".3"/><path d="M8 2h14v14H8z"/>
                        </svg>
                      </div>
                    )}

                    {/* Reel indicator */}
                    {item.type === "reel" && (
                      <div className="absolute top-2 right-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M17 12l-8-4.5v9L17 12z"/>
                        </svg>
                      </div>
                    )}

                    {/* Status indicator */}
                    {isApproved && (
                      <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5" />
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

        <div className="h-16" />
      </div>
    </div>
  );
}
