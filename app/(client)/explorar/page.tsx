"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; type: string; status: string; images: string[]; revisions: Array<{ type: string }>; created_at: string; };

export default function ExplorarPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("producao_items")
        .select("id,type,status,images,revisions,created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data ?? []).map((i) => ({ ...i, images: i.images ?? [], revisions: i.revisions ?? [] })));
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((i) => {
    if (!search) return true;
    return i.type.includes(search.toLowerCase()) || i.status.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ background: "#262626" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Pesquisar"
            className="flex-1 text-sm outline-none bg-transparent text-white placeholder:text-[rgba(255,255,255,0.35)]"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-[1px] mt-[1px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse" style={{ aspectRatio: "1/1", background: "#222" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-white font-semibold">{search ? "Nenhum resultado" : "Nenhum conteúdo ainda"}</p>
          {search && (
            <button onClick={() => setSearch("")} className="text-sm" style={{ color: "#0095F6" }}>
              Limpar pesquisa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[1px] mt-[1px]">
          {filtered.map((item) => {
            const thumb = item.images[0] ?? "";
            const isApproved = item.status === "aprovado" || item.revisions.some((r) => r.type === "approved");
            const isPending = item.status === "em_revisao";
            const href = item.type === "reel" ? `/reels/${item.id}` : `/post/${item.id}`;
            return (
              <Link key={item.id} href={href}>
                <div className="relative" style={{ aspectRatio: "1/1", background: "#111" }}>
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                        {item.type === "reel"
                          ? <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M17 12l-8-4.5v9L17 12z" fill="rgba(255,255,255,0.2)" stroke="none"/></>
                          : <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>
                        }
                      </svg>
                    </div>
                  )}

                  {/* Reel icon */}
                  {item.type === "reel" && (
                    <div className="absolute top-2 right-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M17 12l-8-4.5v9L17 12z"/>
                      </svg>
                    </div>
                  )}
                  {/* Carousel icon */}
                  {item.images.length > 1 && item.type !== "reel" && (
                    <div className="absolute top-2 right-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M2 6h14v14H2z" opacity=".3"/><path d="M8 2h14v14H8z"/>
                      </svg>
                    </div>
                  )}

                  {/* Status dot */}
                  <div
                    className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
                    style={{
                      background: isApproved
                        ? "#4ade80"
                        : isPending
                          ? "#fbbf24"
                          : "rgba(255,255,255,0.3)",
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="h-16" />
    </div>
  );
}
