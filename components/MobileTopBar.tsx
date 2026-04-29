"use client";
import Link from "next/link";
import Logo from "./Logo";
import { mockNotifications } from "@/lib/mock-data";

export default function MobileTopBar() {
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:hidden"
      style={{
        background: "rgba(11,11,15,0.92)",
        borderBottom: "1px solid #1E1E2A",
        height: 52,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Logo size={26} />

      <Link href="/notificacoes">
        <div className="relative w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: "#1A1A22" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
              style={{ background: "#D4FF3F", color: "#0B0B0F", fontSize: 9 }}
            >
              {unread}
            </span>
          )}
        </div>
      </Link>
    </header>
  );
}
