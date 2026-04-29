"use client";
import { useState } from "react";
import Link from "next/link";
import { mockRoteiros, type Roteiro } from "@/lib/mock-data";

const typeLabel: Record<string, string> = {
  post: "Post",
  reel: "Reels",
  carousel: "Carrossel",
  story: "Stories",
};

const typeColor: Record<string, string> = {
  post: "#D4FF3F",
  reel: "#7B4DFF",
  carousel: "#D4FF3F",
  story: "#FF6B6B",
};

export default function Roteiros() {
  const [filter, setFilter] = useState<"pendente" | "revisado">("pendente");

  const filtered = mockRoteiros.filter((r) => r.status === filter);

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Roteiros</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Revise e aprove os roteiros enviados</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["pendente", "revisado"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: filter === tab ? "#D4FF3F" : "#1A1A22",
              color: filter === tab ? "#0B0B0F" : "#9CA3AF",
              border: filter === tab ? "none" : "1px solid #2A2A38",
            }}
          >
            {tab === "pendente" ? "Pendentes" : "Revisados"}
            <span
              className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: filter === tab ? "rgba(0,0,0,0.15)" : "#2A2A38",
                color: filter === tab ? "#0B0B0F" : "#6B7280",
              }}
            >
              {mockRoteiros.filter((r) => r.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Nenhum roteiro {filter === "pendente" ? "pendente" : "revisado"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((roteiro) => (
            <RoteiroCard key={roteiro.id} roteiro={roteiro} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoteiroCard({ roteiro }: { roteiro: Roteiro }) {
  const color = typeColor[roteiro.type];
  const label = typeLabel[roteiro.type];
  const preview = roteiro.content.slice(0, 120).replace(/\n/g, " ") + (roteiro.content.length > 120 ? "…" : "");

  return (
    <Link href={`/roteiros/${roteiro.id}`}>
      <div
        className="rounded-2xl p-4 transition-all active:scale-[0.98]"
        style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}22`, color }}
            >
              {label}
            </span>
            {roteiro.status === "revisado" && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#10B98122", color: "#10B981" }}>
                Aprovado
              </span>
            )}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        <p className="font-semibold mb-1.5">{roteiro.title}</p>
        <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>{preview}</p>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #2A2A38" }}>
          <span className="text-xs" style={{ color: "#6B7280" }}>Criado em {roteiro.createdAt}</span>
          <span className="text-xs" style={{ color: "#6B7280" }}>
            {roteiro.history.length} {roteiro.history.length === 1 ? "entrada" : "entradas"} no histórico
          </span>
        </div>
      </div>
    </Link>
  );
}
