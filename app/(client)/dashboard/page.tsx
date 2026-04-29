"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  name: string;
  instagram: string | null;
  avatar: string | null;
  followers: number;
  following: number;
  posts: number;
  growth: number;
  warmth_score: number;
};

type Item = { id: string; type: string; status: string; images: string[]; created_at: string; };
type CalEvent = { id: string; title: string; type: string; event_date: string; event_time: string | null; };

const typeLabels: Record<string, string> = { carousel: "Carrossel", reel: "Reels", post: "Post", story: "Stories" };
const typeIcons: Record<string, string> = {
  carousel: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  reel:     "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  post:     "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  story:    "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
};
const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  aguardando: { label: "Aguardando", bg: "rgba(107,114,128,0.15)", text: "#9CA3AF" },
  em_revisao: { label: "Em revisão", bg: "rgba(251,191,36,0.15)",  text: "#FBBF24" },
  aprovado:   { label: "Aprovado",   bg: "rgba(34,197,94,0.15)",   text: "#22C55E" },
  agendado:   { label: "Agendado",   bg: "rgba(99,102,241,0.15)",  text: "#818CF8" },
};
const eventTypeColors: Record<string, string> = { recording: "#7B4DFF", post: "#D4FF3F", reel: "#F59E0B", story: "#FF6B6B" };

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState<Item[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, itemsRes, eventsRes, notifRes] = await Promise.all([
        supabase.from("profiles").select("name,instagram,avatar,followers,following,posts,growth,warmth_score").eq("id", user.id).single(),
        supabase.from("producao_items").select("id,type,status,images,created_at").eq("client_id", user.id).in("status", ["aguardando", "em_revisao"]).order("created_at", { ascending: false }).limit(3),
        supabase.from("calendar_events").select("id,title,type,event_date,event_time").eq("client_id", user.id).gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date").limit(3),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);

      setProfile(profRes.data ?? null);
      setPending(itemsRes.data ?? []);
      setEvents(eventsRes.data ?? []);
      setUnreadCount(notifRes.count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  const firstName = profile?.name?.split(" ")[0] ?? "Olá";

  return (
    <div className="p-4 md:p-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Olá, {firstName} 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Aqui está o resumo do seu perfil</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ideias" className="hidden md:block">
            <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Enviar ideia
            </button>
          </Link>
          <Link href="/notificacoes">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 9 }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex flex-col gap-3 md:hidden">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Seguidores", value: profile ? (profile.followers >= 1000 ? `${(profile.followers / 1000).toFixed(1)}K` : profile.followers) : "—" },
            { label: "Seguindo",   value: profile?.following ?? "—" },
            { label: "Posts",      value: profile?.posts ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <p className="text-lg font-bold">{loading ? "—" : value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Warmth */}
        <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold">Perfil Aquecido</p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Quanto mais você posta, mais seu perfil aquece!</p>
            </div>
            <span className="text-2xl font-bold">{loading ? "—" : `${profile?.warmth_score ?? 0}%`}</span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "#0B0B0F" }}>
            <div className="h-2.5 rounded-full transition-all" style={{ width: `${profile?.warmth_score ?? 0}%`, background: "linear-gradient(90deg, #D4FF3F, #90FF40)" }} />
          </div>
        </div>

        {/* Pending content */}
        <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-sm">Conteúdos para revisar</h2>
            <Link href="/conteudos"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver todos</span></Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <div key={i} className="rounded-xl animate-pulse" style={{ background: "#0B0B0F", height: 56 }} />)}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "#4B5563" }}>Nenhum conteúdo pendente</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map((c) => {
                const st = statusBadge[c.status] ?? statusBadge.aguardando;
                return (
                  <Link key={c.id} href={c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`}>
                    <div className="flex items-center gap-3 rounded-xl p-3 active:opacity-70" style={{ background: "#0B0B0F", border: "1px solid #2A2A38" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,255,63,0.08)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={typeIcons[c.type] ?? typeIcons.post}/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{typeLabels[c.type] ?? c.type}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming events */}
        {events.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-sm">Próximos eventos</h2>
              <Link href="/calendario"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver calendário</span></Link>
            </div>
            <div className="flex flex-col gap-2">
              {events.map((evt) => {
                const color = eventTypeColors[evt.type] ?? "#7B4DFF";
                const d = new Date(evt.event_date + "T00:00:00");
                const day = d.getDate();
                const month = d.toLocaleDateString("pt-BR", { month: "short" });
                return (
                  <div key={evt.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${color}22`, color }}>
                      <span className="text-base font-bold leading-none">{day}</span>
                      <span className="text-xs uppercase" style={{ fontSize: 9 }}>{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{evt.title}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{evt.event_time ?? typeLabels[evt.type] ?? evt.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4 mb-4">

          {/* Profile card */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex items-center gap-3 mb-4">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #D4FF3F" }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#2A2A38", border: "2px solid #D4FF3F" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              )}
              <div>
                <p className="font-semibold">{profile?.instagram ?? profile?.name ?? "—"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                  <span className="text-xs" style={{ color: "#22C55E" }}>Ativo</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Seguidores", profile ? (profile.followers >= 1000 ? `${(profile.followers/1000).toFixed(1)}K` : profile.followers) : "—"],
                ["Seguindo", profile?.following ?? "—"],
                ["Posts", profile?.posts ?? "—"],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <p className="text-base font-bold">{loading ? "—" : v}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{l}</p>
                </div>
              ))}
            </div>
            <Link href="/metricas">
              <button className="w-full mt-4 py-2 rounded-xl text-xs font-medium" style={{ background: "rgba(212,255,63,0.1)", color: "#D4FF3F" }}>
                Ver métricas
              </button>
            </Link>
          </div>

          {/* Growth */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Crescimento</p>
            <div className="flex items-end justify-between mb-1">
              <p className="text-2xl font-bold">
                {loading ? "—" : (profile ? (profile.followers >= 1000 ? `${(profile.followers/1000).toFixed(1)}K` : profile.followers) : "—")}
              </p>
              {profile && profile.growth !== 0 && (
                <span className="text-xs px-2 py-1 rounded-full mb-1" style={{ background: profile.growth > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: profile.growth > 0 ? "#22C55E" : "#EF4444" }}>
                  {profile.growth > 0 ? "+" : ""}{profile.growth}%
                </span>
              )}
            </div>
            <p className="text-xs mb-4" style={{ color: "#6B7280" }}>seguidores totais</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: "#0B0B0F" }}>
                <p className="text-lg font-bold">{loading ? "—" : (profile?.following ?? 0)}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>Seguindo</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: "#0B0B0F" }}>
                <p className="text-lg font-bold">{loading ? "—" : (profile?.posts ?? 0)}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>Posts</p>
              </div>
            </div>
          </div>

          {/* Warmth */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Perfil Aquecido</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔥</span>
              <span className="text-2xl font-bold">{loading ? "—" : `${profile?.warmth_score ?? 0}%`}</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
              {(profile?.warmth_score ?? 0) >= 70 ? "Muito bem! Continue assim." : "Continue postando para aquecer seu perfil!"}
            </p>
            <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#0B0B0F" }}>
              <div className="h-3 rounded-full" style={{ width: `${profile?.warmth_score ?? 0}%`, background: "#D4FF3F" }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Pending content */}
          <div className="col-span-2 rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Conteúdos para revisar</h2>
              <Link href="/conteudos"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver todos</span></Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => <div key={i} className="rounded-xl animate-pulse" style={{ background: "#0B0B0F", height: 140 }} />)}
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-10" style={{ color: "#4B5563" }}>
                <p className="text-sm">Nenhum conteúdo pendente de revisão</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {pending.map((c) => {
                  const st = statusBadge[c.status] ?? statusBadge.aguardando;
                  const thumb = c.images?.[0] ?? "";
                  return (
                    <Link key={c.id} href={c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`}>
                      <div className="rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all" style={{ background: "#0B0B0F" }}>
                        <div className="relative" style={{ height: 120 }}>
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "#0B0B0F" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>
                            {st.label}
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium truncate">{typeLabels[c.type] ?? c.type}</p>
                          <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Próximos eventos</h2>
              <Link href="/calendario"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver calendário</span></Link>
            </div>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => <div key={i} className="rounded-xl animate-pulse" style={{ background: "#0B0B0F", height: 44 }} />)}
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#4B5563" }}>Nenhum evento próximo</p>
            ) : (
              events.map((evt) => {
                const color = eventTypeColors[evt.type] ?? "#7B4DFF";
                const d = new Date(evt.event_date + "T00:00:00");
                const day = d.getDate();
                const month = d.toLocaleDateString("pt-BR", { month: "short" });
                return (
                  <div key={evt.id} className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${color}22`, color }}>
                      <span className="text-sm font-bold leading-none">{day}</span>
                      <span className="uppercase" style={{ fontSize: 8 }}>{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{evt.title}</p>
                      <p className="text-xs truncate" style={{ color: "#6B7280" }}>{evt.event_time ?? typeLabels[evt.type] ?? evt.type}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
