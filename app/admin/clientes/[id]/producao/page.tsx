"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProducaoItem = {
  id: string;
  roteiro_id: string | null;
  roteiro_title: string;
  type: string;
  status: string;
  images: string[];
  caption: string;
};

type ApprovedRoteiro = {
  id: string;
  title: string;
  type: string;
};

const typeLabel: Record<string, string> = { post: "Post", reel: "Reels", carousel: "Carrossel", story: "Stories" };
const typeColor: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", carousel: "#D4FF3F", story: "#FF6B6B" };

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  aguardando: { label: "Aguardando upload", color: "#FBBF24", bg: "#FBBF2422" },
  em_revisao: { label: "Em revisão",        color: "#818CF8", bg: "#818CF822" },
  aprovado:   { label: "Aprovado",          color: "#10B981", bg: "#10B98122" },
  agendado:   { label: "Agendado",          color: "#D4FF3F", bg: "#D4FF3F22" },
};

const groups = [
  { key: "aguardando", label: "Aguardando Upload" },
  { key: "em_revisao", label: "Em Revisão" },
  { key: "aprovado",   label: "Aprovados" },
  { key: "agendado",   label: "Agendados" },
];

export default function Producao() {
  const { id } = useParams() as { id: string };
  const [clientName, setClientName] = useState("");
  const [items, setItems] = useState<ProducaoItem[]>([]);
  const [approvedRoteiros, setApprovedRoteiros] = useState<ApprovedRoteiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [pRes, rRes, nameRes] = await Promise.all([
        supabase.from("producao_items").select("id, roteiro_id, roteiro_title, type, status, images, caption").eq("client_id", id),
        supabase.from("roteiros").select("id, title, type").eq("client_id", id).eq("status", "aprovado").is("producao_id", null),
        supabase.from("profiles").select("name").eq("id", id).single(),
      ]);
      setItems(pRes.data ?? []);
      setApprovedRoteiros(rRes.data ?? []);
      setClientName(nameRes.data?.name ?? "");
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="flex flex-col gap-3 mt-8">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", height: 80 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Link href={`/admin/clientes/${id}`}>
        <div className="flex items-center gap-2 mb-4 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span className="text-sm" style={{ color: "#6B7280" }}>{clientName}</span>
        </div>
      </Link>

      <h1 className="text-xl font-bold mb-1">Produção</h1>
      <p className="text-sm mb-5" style={{ color: "#6B7280" }}>Conteúdos na esteira de produção</p>

      {approvedRoteiros.length > 0 && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(212,255,63,0.06)", border: "1px solid #D4FF3F33" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "#D4FF3F" }}>ROTEIROS APROVADOS — AGUARDANDO CRIAÇÃO</p>
          <div className="flex flex-col gap-2">
            {approvedRoteiros.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{typeLabel[r.type] ?? r.type}</p>
                </div>
                <Link href={`/admin/clientes/${id}/producao/novo?roteiroId=${r.id}&tipo=${r.type}&titulo=${encodeURIComponent(r.title)}`}>
                  <button className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
                    Subir conteúdo
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && approvedRoteiros.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum item em produção ainda.</p>
          <p className="text-xs mt-1">Aprove um roteiro para começar.</p>
        </div>
      ) : (
        groups.map((g) => {
          const groupItems = items.filter((p) => p.status === g.key);
          if (groupItems.length === 0) return null;
          return (
            <div key={g.key} className="mb-5">
              <p className="text-xs font-semibold mb-3" style={{ color: "#6B7280" }}>{g.label.toUpperCase()}</p>
              <div className="flex flex-col gap-3">
                {groupItems.map((item) => {
                  const st = statusConfig[item.status];
                  const tc = typeColor[item.type] ?? "#7B4DFF";
                  return (
                    <Link key={item.id} href={`/admin/clientes/${id}/producao/novo?roteiroId=${item.roteiro_id ?? ""}&tipo=${item.type}&titulo=${encodeURIComponent(item.roteiro_title)}&itemId=${item.id}`}>
                      <div className="rounded-2xl p-4 transition-all active:scale-[0.98]" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                        <div className="flex items-start gap-3">
                          {item.images[0] ? (
                            <img src={item.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0B0B0F", border: "1px dashed #22223A" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${tc}22`, color: tc }}>{typeLabel[item.type] ?? item.type}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: st?.bg ?? "#6B728022", color: st?.color ?? "#6B7280" }}>{st?.label ?? item.status}</span>
                            </div>
                            <p className="font-semibold text-sm truncate">{item.roteiro_title}</p>
                            {item.caption && <p className="text-xs mt-0.5 truncate" style={{ color: "#9CA3AF" }}>{item.caption}</p>}
                            {item.images.length > 1 && <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{item.images.length} imagens</p>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
