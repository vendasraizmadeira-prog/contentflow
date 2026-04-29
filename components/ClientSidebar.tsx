"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

type Profile = { name: string | null; instagram: string | null; avatar: string | null; };

const navMain = [
  {
    href: "/dashboard", label: "Início",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    match: (p: string) => p === "/dashboard",
  },
  {
    href: "/conteudos", label: "Conteúdos",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    match: (p: string) => p.startsWith("/conteudos") || p === "/posts" || p.startsWith("/post/") || p.startsWith("/reels"),
  },
  {
    href: "/roteiros", label: "Roteiros",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    match: (p: string) => p.startsWith("/roteiros"),
  },
  {
    href: "/calendario", label: "Calendário",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    match: (p: string) => p.startsWith("/calendario"),
  },
  {
    href: "/metricas", label: "Meu Perfil",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    match: (p: string) => p.startsWith("/metricas"),
  },
];

const navMore = [
  {
    href: "/ideias", label: "Ideias & Refs",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    match: (p: string) => p.startsWith("/ideias"),
  },
  {
    href: "/notificacoes", label: "Notificações",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    match: (p: string) => p.startsWith("/notificacoes"),
    badge: true,
  },
  {
    href: "/briefing", label: "Briefing",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    match: (p: string) => p.startsWith("/briefing"),
  },
];

function Item({ href, label, icon, active, badge }: { href: string; label: string; icon: string; active: boolean; badge?: number }) {
  return (
    <Link href={href} className="block group">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer select-none"
        style={{
          background: active ? "rgba(212,255,63,0.08)" : "transparent",
          color: active ? "#D4FF3F" : "#7A7A9A",
          transition: "background 120ms, color 120ms",
          boxShadow: active ? "inset 3px 0 0 #D4FF3F" : "none",
        }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#C8C8E8"; } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#7A7A9A"; } }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d={icon} />
        </svg>
        <span className="text-sm font-medium flex-1 leading-none">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 9 }}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ClientSidebar() {
  const pathname = usePathname() ?? "";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { count }] = await Promise.all([
        supabase.from("profiles").select("name,instagram,avatar").eq("id", user.id).single(),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);
      setProfile(prof);
      setUnread(count ?? 0);
    })();
  }, []);

  return (
    <aside className="flex flex-col w-56 min-h-screen flex-shrink-0" style={{ background: "#0C0C18", borderRight: "1px solid #17172A" }}>
      <div className="px-4 pt-5 pb-5">
        <Logo size={26} />
      </div>

      <nav className="flex-1 px-2.5 overflow-y-auto scrollbar-none">
        {navMain.map(item => (
          <Item key={item.href} href={item.href} label={item.label} icon={item.icon} active={item.match(pathname)} />
        ))}

        <div className="my-3 mx-2.5" style={{ height: 1, background: "#17172A" }} />

        <p className="text-xs font-semibold px-3 mb-1.5" style={{ color: "#3A3A58", letterSpacing: "0.09em" }}>MAIS</p>
        {navMore.map(item => (
          <Item key={item.href} href={item.href} label={item.label} icon={item.icon} active={item.match(pathname)} badge={item.badge ? unread : undefined} />
        ))}
      </nav>

      <div className="p-2.5" style={{ borderTop: "1px solid #17172A" }}>
        <Link href="/logout" className="block">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
            style={{ transition: "background 120ms" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: "1.5px solid #2A2A3A" }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#1A1A2A", border: "1.5px solid #2A2A3A" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A5A7A" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight" style={{ color: "#D8D8F0" }}>{profile?.name ?? "Cliente"}</p>
              {profile?.instagram && <p className="text-xs truncate" style={{ color: "#5A5A7A" }}>@{profile.instagram.replace("@", "")}</p>}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3A3A58" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </div>
        </Link>
      </div>
    </aside>
  );
}
