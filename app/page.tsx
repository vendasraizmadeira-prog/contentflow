"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0B0B0F 0%, #13131D 100%)" }}>
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#D4FF3F" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#0B0B0F"/>
              <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#0B0B0F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ContentFlow</h1>
        </div>
        <p style={{ color: "#6B7280" }}>Gestão de Conteúdo para Agências de Marketing</p>
      </div>

      <div className="flex flex-col gap-4 w-80">
        <Link href="/login?portal=client">
          <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02]" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,255,63,0.15)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="#D4FF3F" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base">Portal do Cliente</p>
              <p className="text-sm" style={{ color: "#6B7280" }}>Revise e aprove seus conteúdos</p>
            </div>
          </div>
        </Link>

        <Link href="/login?portal=admin">
          <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02]" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,77,255,0.15)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="#7B4DFF" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="#7B4DFF" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="#7B4DFF" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="#7B4DFF" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base">Portal do Admin</p>
              <p className="text-sm" style={{ color: "#6B7280" }}>Gerencie clientes e conteúdos</p>
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-10 text-xs" style={{ color: "#3A3A4A" }}>© 2025 ContentFlow. Todos os direitos reservados.</p>
    </div>
  );
}
