"use client";
import Link from "next/link";
import { mockClient, mockMetrics, mockContents, mockNotifications, mockCalendarEvents } from "@/lib/mock-data";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  review: { bg: "rgba(251,191,36,0.15)", text: "#FBBF24", label: "Em revisão" },
  approved: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Aprovado" },
  scheduled: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", label: "Agendado" },
  posted: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF", label: "Postado" },
};

const typeLabels: Record<string, string> = {
  carousel: "Post Carrossel",
  reel: "Reels",
  post: "Post",
  story: "Stories",
};

const typeIcons: Record<string, string> = {
  carousel: "M4 6h16M4 10h16M4 14h16M4 18h16",
  reel: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  post: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  story: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
};

const miniChartPoints = mockMetrics.map((m, i) => {
  const x = (i / (mockMetrics.length - 1)) * 180;
  const min = 22000, max = 26000;
  const y = 50 - ((m.followers - min) / (max - min)) * 45;
  return `${x},${y}`;
}).join(" ");

export default function Dashboard() {
  const pending = mockContents.filter((c) => c.status === "review");
  const unread = mockNotifications.filter((n) => !n.read);
  const upcoming = mockCalendarEvents.slice(0, 3);

  return (
    <div className="p-4 md:p-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            Olá, {mockClient.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            Aqui está o resumo do seu perfil
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Enviar ideia — só desktop */}
          <Link href="/ideias" className="hidden md:block">
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              Enviar ideia
            </button>
          </Link>
          <Link href="/notificacoes">
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 9 }}
                >
                  {unread.length}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* ── MOBILE: cards verticais ── */}
      <div className="flex flex-col gap-3 md:hidden">

        {/* Seguidores + gráfico */}
        <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Seguidores</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{(mockClient.followers / 1000).toFixed(1)}K</p>
            <span className="text-xs px-2 py-1 rounded-full mb-1" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
              +{mockClient.followerGrowth}%
            </span>
          </div>
          <p className="text-xs mb-2" style={{ color: "#6B7280" }}>vs últimos 30 dias</p>
          <svg viewBox="0 0 180 55" className="w-full" style={{ height: 55 }}>
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4FF3F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#D4FF3F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,50 ${miniChartPoints} 180,50`}
              fill="url(#mg)"
            />
            <polyline
              points={miniChartPoints}
              fill="none"
              stroke="#D4FF3F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex justify-between mt-1">
            {mockMetrics.map((m) => (
              <span key={m.date} className="text-xs" style={{ color: "#4B5563", fontSize: 10 }}>
                {m.date}
              </span>
            ))}
          </div>
        </div>

        {/* Perfil Aquecido */}
        <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Perfil Aquecido</p>
              <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                Quanto mais você posta, mais seu perfil aquece!
              </p>
            </div>
            <div className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{mockClient.warmthScore}%</span>
          </div>
          <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#0B0B0F" }}>
            <div
              className="h-3 rounded-full"
              style={{
                width: `${mockClient.warmthScore}%`,
                background: "linear-gradient(90deg, #D4FF3F, #90FF40)",
              }}
            />
          </div>
        </div>

        {/* Conteúdos para revisar */}
        <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-sm">Conteúdos para revisar</h2>
            <Link href="/conteudos">
              <span className="text-xs" style={{ color: "#D4FF3F" }}>Ver todos</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((c) => (
              <Link key={c.id} href={c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`}>
                <div
                  className="flex items-center gap-3 rounded-xl p-3 active:opacity-70"
                  style={{ background: "#0B0B0F", border: "1px solid #2A2A38" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(212,255,63,0.08)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={typeIcons[c.type]} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{typeLabels[c.type]}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                      Prazo: {c.date}
                    </p>
                  </div>
                  {c.comments > 0 && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: "#D4FF3F", color: "#0B0B0F" }}
                    >
                      {c.comments}
                    </div>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP: grid layout original ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Profile Card */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex items-center gap-3 mb-4">
              <img src={mockClient.avatar} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid #D4FF3F" }} />
              <div>
                <p className="font-semibold">{mockClient.instagram}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22C55E" }} />
                  <span className="text-xs" style={{ color: "#22C55E" }}>Loja Verde</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["Seguidores", mockClient.followers.toLocaleString("pt-BR")], ["Seguindo", mockClient.following], ["Posts", mockClient.posts]].map(([l, v]) => (
                <div key={l as string}>
                  <p className="text-base font-bold">{v}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{l}</p>
                </div>
              ))}
            </div>
            <Link href="/metricas">
              <button className="w-full mt-4 py-2 rounded-xl text-xs font-medium" style={{ background: "rgba(212,255,63,0.1)", color: "#D4FF3F" }}>
                Ver perfil
              </button>
            </Link>
          </div>

          {/* Growth Chart */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs" style={{ color: "#6B7280" }}>Seguidores</p>
                <p className="text-2xl font-bold">{(mockClient.followers / 1000).toFixed(1)}K</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                +{mockClient.followerGrowth}%
              </span>
            </div>
            <svg viewBox="0 0 180 55" className="w-full" style={{ height: 60 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4FF3F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4FF3F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline points={miniChartPoints} fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between mt-1">
              {mockMetrics.map((m) => (
                <span key={m.date} className="text-xs" style={{ color: "#4B5563" }}>{m.date}</span>
              ))}
            </div>
          </div>

          {/* Warmth */}
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>Perfil Aquecido</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔥</span>
              <span className="text-2xl font-bold">{mockClient.warmthScore}%</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#6B7280" }}>Muito bem! Continue assim.</p>
            <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "#0B0B0F" }}>
              <div className="h-3 rounded-full" style={{ width: `${mockClient.warmthScore}%`, background: "#D4FF3F" }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Conteúdos para revisar</h2>
              <Link href="/conteudos"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver todos</span></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {pending.slice(0, 3).map((c) => (
                <Link key={c.id} href={c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`}>
                  <div className="rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all" style={{ background: "#0B0B0F" }}>
                    <div className="relative">
                      <img src={c.thumbnail} alt="" className="w-full object-cover" style={{ height: 120 }} />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: statusColors[c.status].bg, color: statusColors[c.status].text }}>
                        {statusColors[c.status].label}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{c.title}</p>
                      <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{c.date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Próximos eventos</h2>
              <Link href="/calendario"><span className="text-xs" style={{ color: "#D4FF3F" }}>Ver calendário</span></Link>
            </div>
            {upcoming.map((evt, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${evt.color}22`, color: evt.color }}>
                  {evt.date}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{evt.label}</p>
                  <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                    {evt.type === "recording" ? "Gravação" : "Post"} — {evt.date < 15 ? "Hoje, 10:00" : "Amanhã às 14:00"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
