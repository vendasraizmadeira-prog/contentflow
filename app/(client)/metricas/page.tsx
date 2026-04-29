"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string;
  instagram: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
  growth: number;
  warmth_score: number;
};

type ContentItem = {
  id: string;
  type: string;
  status: string;
  images: string[];
  caption: string | null;
};

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  aguardando: { label: "Aguardando", bg: "rgba(107,114,128,0.85)", color: "#fff" },
  em_revisao: { label: "Em revisão", bg: "rgba(251,191,36,0.85)",  color: "#000" },
  aprovado:   { label: "Aprovado",   bg: "rgba(34,197,94,0.85)",   color: "#000" },
  agendado:   { label: "Agendado",   bg: "rgba(129,140,248,0.85)", color: "#000" },
};

export default function Metricas() {
  const [activeTab, setActiveTab] = useState<"grid" | "stats">("grid");
  const [contentTab, setContentTab] = useState<"posts" | "reels">("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, instagram, avatar, followers, following, posts, growth, warmth_score")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: items } = await supabase
        .from("producao_items")
        .select("id, type, status, images, caption")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      setContents(
        (items ?? []).map((it: { id: string; type: string; status: string; images: string[] | null; caption: string | null }) => ({
          id: it.id,
          type: it.type,
          status: it.status,
          images: it.images ?? [],
          caption: it.caption,
        }))
      );
      setLoadingContents(false);
    };
    load();
  }, []);

  const name = profile?.name ?? "—";
  const instagram = profile?.instagram ?? "@handle";
  const avatar = profile?.avatar ?? "";
  const followers = profile?.followers ?? 0;
  const following = profile?.following ?? 0;
  const posts = profile?.posts ?? 0;
  const followerGrowth = profile?.growth ?? 0;
  const warmthScore = profile?.warmth_score ?? 0;

  const filteredContents = contents.filter((c) =>
    contentTab === "reels" ? c.type === "reel" : c.type !== "reel"
  );

  const GridContent = ({ cols }: { cols: number }) => {
    if (loadingContents) {
      return (
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square animate-pulse" style={{ background: "#0F0F1E" }} />
          ))}
        </div>
      );
    }

    if (filteredContents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#0F0F1E" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p className="font-semibold" style={{ color: "#6B7280" }}>Nenhum conteúdo ainda</p>
          <p className="text-xs text-center" style={{ color: "#4B5563" }}>Sua agência está criando seu conteúdo</p>
        </div>
      );
    }

    return (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {filteredContents.map((c) => {
          const thumbnail = c.images?.[0] ?? "";
          const st = statusConfig[c.status] ?? statusConfig.aguardando;
          const href = c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`;
          return (
            <Link key={c.id} href={href}>
              <div className="relative aspect-square overflow-hidden" style={{ background: "#0F0F1E" }}>
                {thumbnail ? (
                  <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "#0F0F1E" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
                {c.type === "reel" && (
                  <div className="absolute top-2 right-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
                {c.type === "carousel" && (
                  <div className="absolute top-2 right-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h2a2 2 0 012 2v2M8 3H6a2 2 0 00-2 2v2"/></svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-1.5 pb-1.5">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: st.bg, color: st.color, fontSize: 9 }}>
                    {st.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  const ContentTabs = () => (
    <div className="flex" style={{ borderBottom: "1px solid #1E1E2A" }}>
      {(["posts", "reels"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setContentTab(t)}
          className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide"
          style={{
            color: contentTab === t ? "#fff" : "#6B7280",
            borderBottom: contentTab === t ? "2px solid #D4FF3F" : "2px solid transparent",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F" }}>

      {/* ═══════════ MOBILE ═══════════ */}
      <div className="md:hidden">

        <div className="px-4 pt-2 pb-3" style={{ background: "#0F0F17", borderBottom: "1px solid #1E1E2A" }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: "#6B7280" }}>Perfil Aquecido</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#22223A" }}>
              <div className="h-2 rounded-full" style={{ width: `${warmthScore}%`, background: "linear-gradient(90deg, #4B5563 10%, #D4FF3F 100%)" }} />
            </div>
            <span className="text-xs font-bold" style={{ color: "#D4FF3F" }}>{warmthScore}%</span>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-5 mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5" style={{ background: "linear-gradient(135deg, #D4FF3F, #90FF40)" }}>
                {avatar ? (
                  <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" style={{ border: "2px solid #0B0B0F" }} />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#0F0F1E", color: "#D4FF3F", border: "2px solid #0B0B0F" }}>
                    {name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 text-center gap-1">
              {[
                [posts, "Posts"],
                [followers >= 1000 ? (followers / 1000).toFixed(1) + "K" : followers, "Seguidores"],
                [following, "Seguindo"],
              ].map(([v, l]) => (
                <div key={l as string}>
                  <p className="text-lg font-bold leading-tight">{v}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>{instagram}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
            <span className="text-xs" style={{ color: "#22C55E" }}>Conta conectada</span>
            {followerGrowth > 0 && (
              <span className="text-xs ml-2" style={{ color: "#6B7280" }}>
                <span style={{ color: "#22C55E" }}>+{followerGrowth}%</span> nos últimos 30 dias
              </span>
            )}
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex" style={{ borderBottom: "1px solid #1E1E2A" }}>
          <button
            onClick={() => setActiveTab("grid")}
            className="flex-1 py-3 flex items-center justify-center"
            style={{ borderBottom: activeTab === "grid" ? "2px solid #D4FF3F" : "2px solid transparent" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={activeTab === "grid" ? "#D4FF3F" : "#6B7280"}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className="flex-1 py-3 flex items-center justify-center"
            style={{ borderBottom: activeTab === "stats" ? "2px solid #D4FF3F" : "2px solid transparent" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === "stats" ? "#D4FF3F" : "#6B7280"} strokeWidth="2" strokeLinecap="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </button>
        </div>

        {activeTab === "grid" && (
          <>
            <ContentTabs />
            <GridContent cols={3} />
          </>
        )}

        {activeTab === "stats" && (
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Crescimento", value: `+${followerGrowth}%`, sub: "nos últimos 30 dias", color: "#22C55E" },
                { label: "Alcance", value: "—", sub: "dados em breve", color: "#D4FF3F" },
                { label: "Engajamento", value: "—", sub: "dados em breve", color: "#7B4DFF" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-3" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                  <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs mt-1 leading-tight" style={{ color: s.color }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-sm">Status do Perfil</p>
                <span className="text-sm font-bold" style={{ color: "#D4FF3F" }}>{warmthScore}%</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold">{warmthScore}%</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(212,255,63,0.15)", color: "#D4FF3F" }}>
                  Perfil Aquecido
                </span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#22223A" }}>
                <div className="h-3 rounded-full" style={{ width: `${warmthScore}%`, background: "linear-gradient(90deg, #4B5563 0%, #D4FF3F 100%)" }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ DESKTOP ═══════════ */}
      <div className="hidden md:block p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Acompanhe o crescimento do seu perfil</p>
        </div>

        <div className="rounded-2xl p-5 mb-4 flex items-center gap-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <div className="w-16 h-16 rounded-full p-0.5 flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4FF3F, #90FF40)" }}>
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" style={{ border: "2px solid #0B0B0F" }}/>
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#0F0F1E", color: "#D4FF3F", border: "2px solid #0B0B0F" }}>
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-xl">{instagram}</h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>{name}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }}/>
              <span className="text-xs" style={{ color: "#22C55E" }}>Conta conectada</span>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-8 text-center">
            {[
              ["Seguidores", followers >= 1000 ? (followers / 1000).toFixed(1) + "K" : followers],
              ["Seguindo", following],
              ["Posts", posts],
            ].map(([l, v]) => (
              <div key={l as string}>
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: "Crescimento", value: `+${followerGrowth}%`, sub: "nos últimos 30 dias", color: "#22C55E" },
            { label: "Alcance", value: "—", sub: "dados em breve", color: "#D4FF3F" },
            { label: "Engajamento", value: "—", sub: "dados em breve", color: "#7B4DFF" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: s.color }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #22223A" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#0F0F1E", borderBottom: "1px solid #22223A" }}>
            <h3 className="font-semibold text-sm">Conteúdos</h3>
            <div className="flex gap-1">
              {(["posts", "reels"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContentTab(t)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all"
                  style={{
                    background: contentTab === t ? "rgba(212,255,63,0.15)" : "transparent",
                    color: contentTab === t ? "#D4FF3F" : "#6B7280",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: "#0B0B0F" }}>
            <GridContent cols={4} />
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Perfil Aquecido</h3>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl font-bold">{warmthScore}%</span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(212,255,63,0.15)", color: "#D4FF3F" }}>Perfil Aquecido</span>
          </div>
          <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: "#22223A" }}>
            <div className="h-4 rounded-full" style={{ width: `${warmthScore}%`, background: "linear-gradient(90deg, #4B5563 0%, #D4FF3F 100%)" }}/>
          </div>
        </div>
      </div>
    </div>
  );
}
