"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InstagramBottomNav() {
  const pathname = usePathname() ?? "";
  const [avatar, setAvatar] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { count }] = await Promise.all([
        supabase.from("profiles").select("avatar").eq("id", user.id).single(),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
      ]);
      setAvatar(prof?.avatar ?? null);
      setUnread(count ?? 0);
    })();
  }, []);

  const isHome = pathname === "/dashboard";
  const isExplore = pathname === "/explorar" || pathname.startsWith("/post/");
  const isReels = pathname === "/reels" || pathname.startsWith("/reels/");
  const isNotif = pathname === "/notificacoes";
  const isProfile = pathname === "/perfil";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center md:hidden"
      style={{
        background: "rgba(0,0,0,0.96)",
        borderTop: "0.5px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        height: 49,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Home */}
      <Link href="/dashboard" className="flex-1 flex items-center justify-center h-full">
        <svg width="26" height="26" viewBox="0 0 24 24" fill={isHome ? "white" : "none"} stroke="white" strokeWidth={isHome ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l9-9 9 9v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1z" fill={isHome ? "white" : "none"} stroke={isHome ? "none" : "white"} strokeWidth="1.8" />
        </svg>
      </Link>

      {/* Explorar */}
      <Link href="/explorar" className="flex-1 flex items-center justify-center h-full">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" fill={isExplore ? "white" : "none"} stroke={isExplore ? "none" : "white"} strokeWidth="1.8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </Link>

      {/* Reels */}
      <Link href="/reels" className="flex-1 flex items-center justify-center h-full">
        <svg width="26" height="26" viewBox="0 0 24 24" fill={isReels ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M17 12l-8-4.5v9L17 12z" fill={isReels ? "black" : "white"} stroke="none" />
        </svg>
      </Link>

      {/* Notificações (heart) */}
      <Link href="/notificacoes" className="flex-1 flex items-center justify-center h-full relative">
        <svg width="26" height="26" viewBox="0 0 24 24" fill={isNotif ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        {unread > 0 && (
          <span
            className="absolute flex items-center justify-center font-bold"
            style={{
              top: 6, right: "calc(50% - 20px)",
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
      </Link>

      {/* Perfil */}
      <Link href="/perfil" className="flex-1 flex items-center justify-center h-full">
        <div
          className="rounded-full overflow-hidden flex-shrink-0"
          style={{
            width: 26,
            height: 26,
            background: "#333",
            outline: isProfile ? "2px solid white" : "none",
            outlineOffset: 1,
          }}
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
        </div>
      </Link>
    </nav>
  );
}
