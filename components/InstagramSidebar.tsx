"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { name: string | null; instagram: string | null; avatar: string | null };

const navItems = [
  {
    href: "/dashboard", label: "Início",
    match: (p: string) => p === "/dashboard",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1z" fill={active ? "white" : "none"} stroke={active ? "none" : "white"} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/explorar", label: "Explorar",
    match: (p: string) => p === "/explorar" || p.startsWith("/post/"),
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" fill={active ? "white" : "none"} stroke={active ? "none" : "white"} strokeWidth="1.8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/reels", label: "Reels",
    match: (p: string) => p === "/reels" || p.startsWith("/reels/"),
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M17 12l-8-4.5v9L17 12z" fill={active ? "black" : "white"} stroke="none" />
      </svg>
    ),
  },
  {
    href: "/notificacoes", label: "Notificações", badge: true,
    match: (p: string) => p === "/notificacoes",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    href: "/perfil", label: "Perfil",
    match: (p: string) => p === "/perfil",
    icon: (_active: boolean) => null,
    isProfile: true,
  },
];

export default function InstagramSidebar() {
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
    <aside
      className="hidden md:flex flex-col w-[244px] min-h-screen flex-shrink-0 sticky top-0"
      style={{ background: "#000", borderRight: "0.5px solid rgba(255,255,255,0.12)" }}
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <span className="text-2xl font-bold italic tracking-tight" style={{ color: "white", fontFamily: "Georgia, serif" }}>
          Instagram
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all relative"
                style={{
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  color: "white",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div className="relative flex-shrink-0">
                  {item.isProfile ? (
                    <div
                      className="rounded-full overflow-hidden"
                      style={{
                        width: 24, height: 24,
                        background: "#333",
                        outline: active ? "2px solid white" : "none",
                        outlineOffset: 1,
                      }}
                    >
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    item.icon(active)
                  )}
                  {item.badge && unread > 0 && (
                    <span
                      className="absolute flex items-center justify-center font-bold"
                      style={{
                        top: -4, right: -4,
                        width: 16, height: 16,
                        background: "#FF3040",
                        color: "white",
                        fontSize: 9,
                        borderRadius: "50%",
                        border: "1.5px solid black",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <span className={`text-[15px] leading-none ${active ? "font-bold" : "font-normal"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 mt-2" style={{ borderTop: "0.5px solid rgba(255,255,255,0.12)" }}>
        <Link href="/logout">
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#333" }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{profile?.name ?? "Cliente"}</p>
              {profile?.instagram && (
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {profile.instagram.startsWith("@") ? profile.instagram : `@${profile.instagram}`}
                </p>
              )}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </div>
        </Link>
      </div>
    </aside>
  );
}
