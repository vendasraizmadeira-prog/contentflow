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

export default function Posts() {
  const [activeStatus, setActiveStatus] = useState("all");

  const posts = mockContents.filter((c) => c.type === "post" || c.type === "carousel");
  const filtered = activeStatus === "all" ? posts : posts.filter((c) => c.status === activeStatus);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Posts</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Fotos e carrosséis para revisão</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {statusTabs.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveStatus(s.key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeStatus === s.key ? "#D4FF3F" : "#1A1A22",
              color: activeStatus === s.key ? "#0B0B0F" : "#9CA3AF",
              border: activeStatus === s.key ? "none" : "1px solid #2A2A38",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum post encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c) => {
            const badge = statusBadge[c.status] ?? statusBadge.posted;
            return (
              <Link key={c.id} href={`/post/${c.id}`}>
                <div className="relative aspect-square rounded-2xl overflow-hidden active:scale-[0.97] transition-transform">
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }}
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
                  {/* Carousel icon */}
                  {c.type === "carousel" && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                      </svg>
                    </div>
                  )}
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
