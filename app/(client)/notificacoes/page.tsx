"use client";
import { useState } from "react";
import { mockNotifications } from "@/lib/mock-data";

const typeIcons: Record<string, { icon: string; color: string }> = {
  review: { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "#FBBF24" },
  recording: { icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z", color: "#FF6B6B" },
  approved: { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#22C55E" },
  briefing: { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "#7B4DFF" },
};

export default function Notificacoes() {
  const [notifs, setNotifs] = useState(mockNotifications);

  const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const markOne = (id: string) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));

  const today = notifs.slice(0, 2);
  const earlier = notifs.slice(2);

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{notifs.filter(n => !n.read).length} não lidas</p>
        </div>
        <button onClick={markAll} className="text-sm" style={{ color: "#D4FF3F" }}>Marcar todas como lidas</button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>HOJE</p>
        {today.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)} className="rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:opacity-90" style={{ background: n.read ? "#1A1A22" : "rgba(212,255,63,0.06)", border: `1px solid ${n.read ? "#2A2A38" : "rgba(212,255,63,0.2)"}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${typeIcons[n.type].color}20` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeIcons[n.type].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={typeIcons[n.type].icon}/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{n.message}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs" style={{ color: "#6B7280" }}>{n.time}</span>
              {!n.read && <div className="w-2 h-2 rounded-full" style={{ background: "#D4FF3F" }}/>}
            </div>
          </div>
        ))}

        <p className="text-xs font-medium mb-1 mt-4" style={{ color: "#6B7280" }}>MAIS CEDO</p>
        {earlier.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)} className="rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:opacity-90" style={{ background: "#1A1A22", border: "1px solid #2A2A38", opacity: n.read ? 0.6 : 1 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${typeIcons[n.type].color}20` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeIcons[n.type].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={typeIcons[n.type].icon}/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{n.message}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "#6B7280" }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
