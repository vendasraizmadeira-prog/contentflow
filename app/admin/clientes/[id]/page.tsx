"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminClient } from "@/components/AdminClientContext";

type Profile = {
  id: string;
  name: string;
  instagram: string;
  avatar: string;
  followers: number;
  growth: number;
};

export default function ClienteHub() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { setSelectedClient } = useAdminClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [roteirosStats, setRoteirosStats] = useState({ pendentes: 0, aprovados: 0 });
  const [producaoStats, setProducaoStats] = useState({ emProducao: 0, aprovados: 0 });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [profileRes, roteirosRes, producaoRes] = await Promise.all([
        supabase.from("profiles").select("id, name, instagram, avatar, followers, growth").eq("id", id).single(),
        supabase.from("roteiros").select("status").eq("client_id", id),
        supabase.from("producao_items").select("status").eq("client_id", id),
      ]);

      const p = profileRes.data;
      if (!p) { setLoading(false); return; }

      setProfile(p);
      setSelectedClient({ id: p.id, name: p.name ?? "", avatar: p.avatar ?? "" });

      const roteiros = roteirosRes.data ?? [];
      setRoteirosStats({
        pendentes: roteiros.filter((r) => r.status === "enviado" || r.status === "em_revisao").length,
        aprovados: roteiros.filter((r) => r.status === "aprovado").length,
      });

      const producao = producaoRes.data ?? [];
      setProducaoStats({
        emProducao: producao.filter((p) => p.status === "aguardando" || p.status === "em_revisao").length,
        aprovados: producao.filter((p) => p.status === "aprovado").length,
      });

      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="rounded-2xl p-4 mb-5 animate-pulse" style={{ background: "#0F0F1E", height: 96 }} />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#0F0F1E", height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-center" style={{ color: "#6B7280" }}>Cliente não encontrado.</div>;
  }

  const sections = [
    {
      href: `/admin/clientes/${id}/roteiros`,
      label: "Roteiros",
      desc: `${roteirosStats.pendentes} aguardando · ${roteirosStats.aprovados} aprovados`,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "#7B4DFF",
      badge: roteirosStats.pendentes,
    },
    {
      href: `/admin/clientes/${id}/producao`,
      label: "Produção",
      desc: `${producaoStats.emProducao} em produção · ${producaoStats.aprovados} aprovados`,
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "#D4FF3F",
      badge: producaoStats.emProducao,
    },
    {
      href: `/admin/clientes/${id}/perfil`,
      label: "Perfil Instagram",
      desc: "Editar foto, bio, destaques",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "#F59E0B",
      badge: 0,
    },
    {
      href: `/admin/briefings`,
      label: "Briefing",
      desc: "Diagnóstico estratégico",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      color: "#10B981",
      badge: 0,
    },
    {
      href: "/admin/calendario",
      label: "Calendário",
      desc: "Agenda de publicações",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "#818CF8",
      badge: 0,
    },
    {
      href: "/admin/gravacoes",
      label: "Gravações",
      desc: "Agenda de gravações",
      icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
      color: "#FF6B6B",
      badge: 0,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <Link href="/admin/clientes">
        <div className="flex items-center gap-2 mb-5 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span className="text-sm" style={{ color: "#6B7280" }}>Todos os clientes</span>
        </div>
      </Link>

      <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
        <div className="relative flex-shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full object-cover" style={{ border: "2px solid #7B4DFF" }} />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF", border: "2px solid #7B4DFF" }}>
              {profile.name?.charAt(0) ?? "?"}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ background: "#22C55E", borderColor: "#0F0F1E" }} />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight">{profile.name}</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>{profile.instagram || "—"}</p>
          <div className="flex gap-4 mt-2">
            {profile.followers > 0 && (
              <span className="text-xs"><b>{(profile.followers / 1000).toFixed(1)}K</b> <span style={{ color: "#6B7280" }}>seguidores</span></span>
            )}
            {profile.growth > 0 && (
              <span className="text-xs" style={{ color: "#22C55E" }}>+{profile.growth}% / mês</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold mb-3" style={{ color: "#6B7280" }}>GESTÃO DA CONTA</p>
      <div className="grid grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <div className="rounded-2xl p-4 h-full transition-all active:scale-[0.97]" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </div>
                {s.badge > 0 && (
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ background: s.color, color: s.color === "#D4FF3F" ? "#0B0B0F" : "#fff" }}>
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-xs leading-snug" style={{ color: "#6B7280" }}>{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
