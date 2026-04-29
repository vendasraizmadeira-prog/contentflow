"use client";
import { useState } from "react";
import Link from "next/link";
import { mockContents } from "@/lib/mock-data";

const statusTabs = [
  { key: "all", label: "Todos" },
  { key: "review", label: "Em revisão" },
  { key: "approved", label: "Aprovados" },
  { key: "scheduled", label: "Agendados" },
];

const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
  review:    { label: "Em revisão", bg: "#F59E0B", color: "#0B0B0F" },
  approved:  { label: "Aprovado",   bg: "#10B981", color: "#0B0B0F" },
  scheduled: { label: "Agendado",   bg: "#7B4DFF", color: "#fff" },
  posted:    { label: "Postado",    bg: "#374151", color: "#9CA3AF" },
};

export default function ReelsList() {
  const [activeStatus, setActiveStatus] = useState("all");

  const reels = mockContents.filter((c) => c.type === "reel");
  const filtered = activeStatus === "all" ? reels : reels.filter((c) => c.status === activeStatus);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Reels</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Vídeos para revisão</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {statusTabs.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStatus(s.key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeStatus === s.key ? "#7B4DFF" : "#1A1A22",
              color: activeStatus === s.key ? "#fff" : "#9CA3AF",
              border: activeStatus === s.key ? "none" : "1px solid #2A2A38",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid — portrait aspect for reels */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum reel encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c) => {
            const badge = statusBadge[c.status] ?? statusBadge.posted;
            return (
              <Link key={c.id} href={`/reels/${c.id}`}>
                <div
                  className="relative rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
                  style={{ aspectRatio: "9/16" }}
                >
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)" }}
                  />
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {/* Play icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-xs font-semibold text-white truncate">{c.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{c.date}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
