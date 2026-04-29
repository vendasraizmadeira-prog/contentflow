"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; type: string; status: string; images: string[]; caption: string | null; created_at: string; };

const tabs = ["Todos", "Posts", "Carrossel", "Reels", "Stories"];

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  aguardando: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF", label: "Aguardando" },
  em_revisao: { bg: "rgba(251,191,36,0.15)", text: "#FBBF24", label: "Em revisão" },
  aprovado:   { bg: "rgba(34,197,94,0.15)",   text: "#22C55E", label: "Aprovado" },
  agendado:   { bg: "rgba(99,102,241,0.15)",  text: "#818CF8", label: "Agendado" },
};

const typeLabels: Record<string, string> = { carousel: "Carrossel", reel: "Reels", post: "Post", story: "Stories" };

export default function Conteudos() {
  const [tab, setTab] = useState("Todos");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("producao_items")
        .select("id, type, status, images, caption, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = items.filter((c) => {
    if (tab === "Todos") return true;
    if (tab === "Posts") return c.type === "post";
    if (tab === "Carrossel") return c.type === "carousel";
    if (tab === "Reels") return c.type === "reel";
    if (tab === "Stories") return c.type === "story";
    return true;
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Conteúdos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Revise e aprove seus conteúdos</p>
        </div>
        <Link href="/ideias">
          <button className="px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5" style={{ background: "#D4FF3F", color: "#0B0B0F" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span className="hidden sm:inline">Enviar Ideia</span>
            <span className="sm:hidden">Ideia</span>
          </button>
        </Link>
      </div>

      <div className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all" style={{ background: tab === t ? "rgba(212,255,63,0.12)" : "transparent", color: tab === t ? "#D4FF3F" : "#6B7280", borderBottom: tab === t ? "2px solid #D4FF3F" : "2px solid transparent" }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", height: 200 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#0F0F1E" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </div>
          <p className="font-semibold" style={{ color: "#6B7280" }}>Nenhum conteúdo ainda</p>
          <p className="text-xs" style={{ color: "#4B5563" }}>Sua agência está criando seu conteúdo</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((c) => {
            const thumbnail = c.images?.[0] ?? "";
            const st = statusMap[c.status] ?? statusMap.aguardando;
            const href = c.type === "reel" ? `/reels/${c.id}` : `/post/${c.id}`;
            return (
              <Link key={c.id} href={href}>
                <div className="rounded-2xl overflow-hidden active:scale-[0.98] md:hover:scale-[1.01] transition-all cursor-pointer" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
                  <div className="relative" style={{ height: 140 }}>
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#0B0B0F" }}>
                        {c.type === "reel" ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                    </div>
                    {c.type === "reel" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                    )}
                    {c.type === "carousel" && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.7)" }}>
                        1/{c.images?.length || 1}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs mb-0.5" style={{ color: "#6B7280" }}>{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#0B0B0F", color: "#9CA3AF" }}>{typeLabels[c.type] ?? c.type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link href="/ideias">
            <div className="rounded-2xl flex flex-col items-center justify-center p-4 active:opacity-70 transition-all" style={{ background: "#0F0F1E", border: "2px dashed #22223A", minHeight: 200 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22223A" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              <p className="text-xs mt-2 text-center" style={{ color: "#4B5563" }}>Enviar ideia ou referência</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
