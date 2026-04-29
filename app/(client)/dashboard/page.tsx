"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = { name: string | null; instagram: string | null; avatar: string | null; warmth_score: number; followers: number; };
type Item = { id: string; type: string; status: string; images: string[]; created_at: string; };
type CalEvent = { id: string; title: string; type: string; event_date: string; event_time: string | null; };

const statusLabel: Record<string, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "#7A7A9A" },
  em_revisao: { label: "Em revisão", color: "#F59E0B" },
  aprovado:   { label: "Aprovado",   color: "#22C55E" },
  agendado:   { label: "Agendado",   color: "#818CF8" },
};

const typeIcon: Record<string, string> = {
  post:     "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  carousel: "M4 6h16M4 10h16M4 14h16M4 18h7",
  reel:     "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  story:    "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
};
const typeLabel: Record<string, string> = { post: "Post", carousel: "Carrossel", reel: "Reel", story: "Story" };
const eventColors: Record<string, string> = { recording: "#FF6B6B", post: "#D4FF3F", reel: "#7B4DFF", story: "#F59E0B" };
const eventLabel: Record<string, string> = { recording: "Gravação", post: "Post", reel: "Reel", story: "Story" };

function today() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState<Item[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState({ pendentes: 0, aprovados: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profRes, itemsRes, eventsRes, notifRes] = await Promise.all([
        supabase.from("profiles").select("name,instagram,avatar,warmth_score,followers").eq("id", user.id).single(),
        supabase.from("producao_items").select("id,type,status,images,created_at").eq("client_id", user.id).order("created_at", { ascending: false }),
        supabase.from("calendar_events").select("id,title,type,event_date,event_time").eq("client_id", user.id).gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date").limit(3),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);

      setProfile(profRes.data ?? null);
      const all = itemsRes.data ?? [];
      setPending(all.filter(i => i.status === "aguardando" || i.status === "em_revisao").slice(0, 4));
      setCounts({
        pendentes: all.filter(i => i.status === "aguardando" || i.status === "em_revisao").length,
        aprovados: all.filter(i => i.status === "aprovado").length,
      });
      setEvents(eventsRes.data ?? []);
      setUnread(notifRes.count ?? 0);
      setLoading(false);
    })();
  }, []);

  const firstName = profile?.name?.split(" ")[0] ?? "Olá";
  const warmth = profile?.warmth_score ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0F" }}>
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-8 md:px-6 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium capitalize mb-0.5" style={{ color: "#5A5A7A" }}>{today()}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              Olá, {loading ? "—" : firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notificacoes">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: "#13132A", border: "1px solid #22223A" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A7A9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 8 }}>
                    {unread}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 mb-6">
          {loading ? (
            <>
              <div className="h-9 flex-1 rounded-xl animate-pulse" style={{ background: "#13132A" }} />
              <div className="h-9 flex-1 rounded-xl animate-pulse" style={{ background: "#13132A" }} />
              <div className="h-9 flex-1 rounded-xl animate-pulse" style={{ background: "#13132A" }} />
            </>
          ) : (
            <>
              <Link href="/conteudos" className="flex-1">
                <div className="flex items-center justify-center gap-1.5 h-9 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: counts.pendentes > 0 ? "rgba(245,158,11,0.12)" : "#13132A", border: `1px solid ${counts.pendentes > 0 ? "rgba(245,158,11,0.25)" : "#22223A"}`, color: counts.pendentes > 0 ? "#F59E0B" : "#5A5A7A" }}>
                  <span className="font-bold">{counts.pendentes}</span>
                  <span className="text-xs">para revisar</span>
                </div>
              </Link>
              <Link href="/conteudos" className="flex-1">
                <div className="flex items-center justify-center gap-1.5 h-9 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: counts.aprovados > 0 ? "rgba(34,197,94,0.1)" : "#13132A", border: `1px solid ${counts.aprovados > 0 ? "rgba(34,197,94,0.2)" : "#22223A"}`, color: counts.aprovados > 0 ? "#22C55E" : "#5A5A7A" }}>
                  <span className="font-bold">{counts.aprovados}</span>
                  <span className="text-xs">aprovados</span>
                </div>
              </Link>
              <Link href="/ideias" className="flex-1">
                <div className="flex items-center justify-center gap-1.5 h-9 rounded-xl font-semibold text-sm cursor-pointer" style={{ background: "#13132A", border: "1px solid #22223A", color: "#D4FF3F" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  <span className="text-xs">Ideia</span>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Conteúdos para revisar */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm" style={{ color: "#D8D8F0" }}>Para revisar</h2>
            <Link href="/conteudos">
              <span className="text-xs font-medium cursor-pointer" style={{ color: "#D4FF3F" }}>Ver todos</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl flex-shrink-0 animate-pulse" style={{ width: 130, height: 160, background: "#13132A" }} />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center" style={{ background: "#0F0F1E", border: "1px dashed #22223A" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3A3A58" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#3A3A58" }}>Tudo em dia</p>
              <p className="text-xs" style={{ color: "#2A2A40" }}>Sua agência está preparando novos conteúdos</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {pending.map(item => {
                const thumb = item.images?.[0] ?? "";
                const st = statusLabel[item.status] ?? statusLabel.aguardando;
                const href = item.type === "reel" ? `/reels/${item.id}` : `/post/${item.id}`;
                return (
                  <Link key={item.id} href={href} className="flex-shrink-0">
                    <div className="rounded-2xl overflow-hidden cursor-pointer" style={{ width: 130, height: 160, background: "#13132A", position: "relative" }}>
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#0F0F1E" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A3A58" strokeWidth="1.5" strokeLinecap="round">
                            <path d={typeIcon[item.type] ?? typeIcon.post} />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-xs font-semibold text-white">{typeLabel[item.type] ?? item.type}</p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: st.color }}>{st.label}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {counts.pendentes > pending.length && (
                <Link href="/conteudos" className="flex-shrink-0">
                  <div className="rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer" style={{ width: 130, height: 160, background: "#0F0F1E", border: "1px dashed #22223A" }}>
                    <span className="font-bold text-lg" style={{ color: "#D4FF3F" }}>+{counts.pendentes - pending.length}</span>
                    <span className="text-xs" style={{ color: "#5A5A7A" }}>mais</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Próximos eventos */}
        {(loading || events.length > 0) && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm" style={{ color: "#D8D8F0" }}>Próximos eventos</h2>
              <Link href="/calendario">
                <span className="text-xs font-medium cursor-pointer" style={{ color: "#D4FF3F" }}>Ver agenda</span>
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #17172A" }}>
              {loading ? (
                <div className="p-4 flex flex-col gap-3">
                  {[1, 2].map(i => <div key={i} className="h-11 rounded-xl animate-pulse" style={{ background: "#13132A" }} />)}
                </div>
              ) : (
                events.map((evt, i) => {
                  const color = eventColors[evt.type] ?? "#7B4DFF";
                  const d = new Date(evt.event_date + "T12:00:00");
                  const day = d.getDate();
                  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
                  return (
                    <div
                      key={evt.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < events.length - 1 ? "1px solid #17172A" : "none" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                        <span className="font-bold leading-none" style={{ color, fontSize: 14 }}>{day}</span>
                        <span className="uppercase leading-none mt-0.5" style={{ color, fontSize: 9, opacity: 0.8 }}>{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{evt.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#5A5A7A" }}>
                          {eventLabel[evt.type] ?? evt.type}{evt.event_time ? ` · ${evt.event_time}` : ""}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0" style={{ background: `${color}18`, color }}>
                        {eventLabel[evt.type] ?? evt.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Perfil Aquecido */}
        <section>
          <div className="rounded-2xl p-4" style={{ background: "#0F0F1E", border: "1px solid #17172A" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm" style={{ color: "#D8D8F0" }}>Perfil Aquecido</p>
                <p className="text-xs mt-0.5" style={{ color: "#5A5A7A" }}>Continue postando para manter o engajamento</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: warmth >= 70 ? "#D4FF3F" : warmth >= 40 ? "#F59E0B" : "#5A5A7A" }}>
                {loading ? "—" : `${warmth}%`}
              </span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "#17172A" }}>
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${warmth}%`,
                  background: warmth >= 70
                    ? "linear-gradient(90deg, #90FF40, #D4FF3F)"
                    : warmth >= 40
                    ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                    : "linear-gradient(90deg, #3A3A58, #4A4A68)",
                  transition: "width 600ms ease",
                }}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
