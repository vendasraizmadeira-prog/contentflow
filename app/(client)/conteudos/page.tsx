"use client";
import { useState } from "react";
import Link from "next/link";
import { mockContents } from "@/lib/mock-data";

const tabs = ["Todos", "Posts", "Carrossel", "Reels", "Stories"];
const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  review: { bg: "rgba(251,191,36,0.15)", text: "#FBBF24", label: "Em revisão" },
  approved: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Aprovado" },
  scheduled: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", label: "Agendado" },
  posted: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF", label: "Postado" },
};
const typeLabels: Record<string, string> = { carousel: "Carrossel", reel: "Reels", post: "Post", story: "Stories" };

export default function Conteudos() {
  const [tab, setTab] = useState("Todos");

  const filtered = mockContents.filter((c) => {
    return (
      tab === "Todos" ||
      (tab === "Posts" && c.type === "post") ||
      (tab === "Carrossel" && c.type === "carousel") ||
      (tab === "Reels" && c.type === "reel") ||
      (tab === "Stories" && c.type === "story")
    );
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Conteúdos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Revise e aprove seus conteúdos</p>
        </div>
        <Link href="/ideias">
          <button className="px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <span className="hidden sm:inline">Enviar Ideia</span>
            <span className="sm:hidden">Ideia</span>
          </button>
        </Link>
      </div>

      {/* Tabs — scroll horizontal no mobile */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all"
            style={{
              background: tab === t ? "rgba(212,255,63,0.12)" : "transparent",
              color: tab === t ? "#D4FF3F" : "#6B7280",
              borderBottom: tab === t ? "2px solid #D4FF3F" : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid — 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {filtered.map((c) => (
          <Link key={c.id} href={c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`}>
            <div className="rounded-2xl overflow-hidden active:scale-[0.98] md:hover:scale-[1.01] transition-all cursor-pointer" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <div className="relative">
                <img src={c.thumbnail} alt="" className="w-full object-cover" style={{ height: 140 }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: statusMap[c.status].bg, color: statusMap[c.status].text }}>
                    {statusMap[c.status].label}
                  </span>
                </div>
                {c.type === "reel" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </div>
                  </div>
                )}
                {c.type === "carousel" && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>
                    1/{(c as any).images?.length || 1}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>ID #{c.id}</p>
                <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>
                    {typeLabels[c.type]}
                  </span>
                  {c.comments > 0 && (
                    <span className="text-xs flex items-center gap-1" style={{ color: "#D4FF3F" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      {c.comments}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Empty slot */}
        <Link href="/ideias">
          <div className="rounded-2xl flex flex-col items-center justify-center p-4 active:opacity-70 transition-all" style={{ background: "#1A1A22", border: "2px dashed #2A2A38", minHeight: 200 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2A2A38" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <p className="text-xs mt-2 text-center" style={{ color: "#4B5563" }}>Enviar ideia ou referência</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
