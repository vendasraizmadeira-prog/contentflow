"use client";
import { useState, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Notif = {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  read: boolean;
  url: string | null;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "agora";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
  const d = Math.floor(diff / 86400000);
  return `${d} d`;
}

const typeConfig: Record<string, { bg: string; icon: ReactElement }> = {
  review: {
    bg: "linear-gradient(135deg, #f9ce34, #ee2a7b)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  approved: {
    bg: "linear-gradient(135deg, #4ade80, #16a34a)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
  },
  change_request: {
    bg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
    ),
  },
  recording: {
    bg: "linear-gradient(135deg, #f87171, #dc2626)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
      </svg>
    ),
  },
  general: {
    bg: "linear-gradient(135deg, #818cf8, #7B4DFF)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

export default function NotificacoesPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ avatar: string | null; name: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: notifData }, { data: profData }] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(60),
        supabase.from("profiles").select("avatar,name").eq("id", user.id).single(),
      ]);

      setNotifs(notifData ?? []);
      setProfile(profData);
      setLoading(false);

      // Mark all as read
      if ((notifData ?? []).some((n) => !n.read)) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("read", false);
      }
    })();
  }, []);

  const today = notifs.filter((n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const thisWeek = notifs.filter((n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff < 7 * 86400000 && d.toDateString() !== now.toDateString();
  });
  const older = notifs.filter((n) => {
    const d = new Date(n.created_at);
    const now = new Date();
    return now.getTime() - d.getTime() >= 7 * 86400000;
  });

  const NotifItem = ({ n }: { n: Notif }) => {
    const cfg = typeConfig[n.type ?? "general"] ?? typeConfig.general;
    const content = (
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Agency avatar / icon */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg }}
        >
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white leading-[1.4]">
            <span className="font-semibold">Agência </span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{n.message || n.title}</span>
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            {timeAgo(n.created_at)}
            {!n.read && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 align-middle" />
            )}
          </p>
        </div>

        {/* Thumbnail */}
        <div
          className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: "#222" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      </div>
    );

    if (n.url) {
      return <Link href={n.url}>{content}</Link>;
    }
    return <div>{content}</div>;
  };

  const Section = ({ title, items }: { title: string; items: Notif[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <p className="px-4 py-2 text-[14px] font-bold text-white">{title}</p>
        {items.map((n) => <NotifItem key={n.id} n={n} />)}
      </div>
    );
  };

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
        <p className="text-[16px] font-bold text-white">Atividade</p>
        <button>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-0 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-11 h-11 rounded-full animate-pulse" style={{ background: "#222" }} />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#222" }} />
                <div className="h-2.5 w-16 rounded animate-pulse" style={{ background: "#222" }} />
              </div>
              <div className="w-11 h-11 rounded-lg animate-pulse" style={{ background: "#222" }} />
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <div className="text-center">
            <p className="text-white font-bold mb-1">Atividade sobre você</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Quando sua agência enviar conteúdos,{"\n"}as notificações aparecerão aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <Section title="Hoje" items={today} />
          <Section title="Esta semana" items={thisWeek} />
          <Section title="Mais antigas" items={older} />
        </div>
      )}

      <div className="h-16" />
    </div>
  );
}
