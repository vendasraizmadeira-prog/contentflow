"use client";
import Link from "next/link";
import Logo from "./Logo";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const titles: Record<string, string> = {
  "/dashboard":    "Início",
  "/conteudos":    "Conteúdos",
  "/roteiros":     "Roteiros",
  "/calendario":   "Calendário",
  "/metricas":     "Meu Perfil",
  "/ideias":       "Ideias & Refs",
  "/notificacoes": "Notificações",
  "/briefing":     "Briefing",
  "/posts":        "Posts",
  "/reels":        "Reels",
};

function getTitle(p: string) {
  if (titles[p]) return titles[p];
  for (const [key, val] of Object.entries(titles)) {
    if (p.startsWith(key + "/")) return val;
  }
  if (p.startsWith("/post/")) return "Conteúdo";
  return null;
}

export default function MobileTopBar() {
  const pathname = usePathname() ?? "";
  const [unread, setUnread] = useState(0);
  const title = getTitle(pathname);
  const isHome = pathname === "/dashboard";

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);
    })();
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:hidden"
      style={{
        background: "rgba(12,12,24,0.94)",
        borderBottom: "1px solid #17172A",
        height: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {isHome ? (
        <Logo size={22} />
      ) : (
        <p className="font-bold text-[15px] tracking-tight">{title}</p>
      )}

      <Link href="/notificacoes">
        <div
          className="relative w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: "#13132A", border: "1px solid #22223A" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A7A9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
              style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 8 }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </Link>
    </header>
  );
}
