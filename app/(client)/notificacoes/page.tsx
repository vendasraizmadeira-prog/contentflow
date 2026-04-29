"use client";
import { useState, useEffect } from "react";
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

const typeIcons: Record<string, { icon: string; color: string }> = {
  review:        { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#FBBF24" },
  change_request:{ icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", color: "#FF6B6B" },
  recording:     { icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z", color: "#FF6B6B" },
  approved:      { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#22C55E" },
  briefing:      { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "#7B4DFF" },
  general:       { icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#9CA3AF" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "agora";
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function Notificacoes() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60);
      setNotifs(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const markAll = async () => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const now = new Date();
  const today = notifs.filter((n) => new Date(n.created_at).toDateString() === now.toDateString());
  const earlier = notifs.filter((n) => new Date(n.created_at).toDateString() !== now.toDateString());
  const unreadCount = notifs.filter((n) => !n.read).length;

  const NotifCard = ({ n, dimmed }: { n: Notif; dimmed?: boolean }) => {
    const cfg = typeIcons[n.type ?? "general"] ?? typeIcons.general;
    return (
      <div
        key={n.id}
        onClick={() => markOne(n.id)}
        className="rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all"
        style={{
          background: n.read ? "#1A1A22" : "rgba(212,255,63,0.06)",
          border: `1px solid ${n.read ? "#2A2A38" : "rgba(212,255,63,0.2)"}`,
          opacity: dimmed && n.read ? 0.6 : 1,
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={cfg.icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{n.title}</p>
          {n.message && <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{n.message}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs" style={{ color: "#6B7280" }}>{relativeTime(n.created_at)}</span>
          {!n.read && <div className="w-2 h-2 rounded-full" style={{ background: "#D4FF3F" }} />}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{unreadCount} não lidas</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll} className="text-sm" style={{ color: "#D4FF3F" }}>Marcar todas como lidas</button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: "#1A1A22" }} />
          ))}
        </div>
      )}

      {!loading && notifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#1A1A22" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="font-semibold" style={{ color: "#6B7280" }}>Nenhuma notificação</p>
        </div>
      )}

      {!loading && notifs.length > 0 && (
        <div className="flex flex-col gap-2">
          {today.length > 0 && (
            <>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>HOJE</p>
              {today.map((n) => <NotifCard key={n.id} n={n} />)}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <p className="text-xs font-medium mb-1 mt-4" style={{ color: "#6B7280" }}>MAIS CEDO</p>
              {earlier.map((n) => <NotifCard key={n.id} n={n} dimmed />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
