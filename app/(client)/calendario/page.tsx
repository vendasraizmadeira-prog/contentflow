"use client";
import { useState } from "react";
import { mockCalendarEvents } from "@/lib/mock-data";

const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const typeColors: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", recording: "#FF6B6B", story: "#FFB347" };
const typeLabels: Record<string, string> = { post: "Post", reel: "Reels", recording: "Gravação", story: "Stories" };

export default function Calendario() {
  const [selected, setSelected] = useState<number | null>(null);
  const month = "Setembro 2025";

  const firstDay = 0; // Sunday
  const daysInMonth = 30;
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const eventsForDay = (day: number) => mockCalendarEvents.filter(e => e.date === day);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Seus conteúdos e gravações agendadas</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0B0B0F" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="font-bold text-lg">{month}</h2>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0B0B0F" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-3">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium py-2" style={{ color: "#6B7280" }}>{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`}/>;
            const events = eventsForDay(day);
            const isSelected = selected === day;
            const isToday = day === 10;
            return (
              <div key={day} onClick={() => setSelected(day === selected ? null : day)} className="rounded-xl p-2 min-h-16 cursor-pointer transition-all" style={{
                background: isSelected ? "rgba(212,255,63,0.1)" : "transparent",
                border: isToday ? "1px solid #D4FF3F" : "1px solid transparent",
              }}>
                <span className="text-sm font-medium" style={{ color: isToday ? "#D4FF3F" : "#fff" }}>{day}</span>
                <div className="flex flex-col gap-0.5 mt-1">
                  {events.slice(0, 2).map((evt, ei) => (
                    <div key={ei} className="text-xs px-1.5 py-0.5 rounded-md truncate" style={{ background: `${evt.color}22`, color: evt.color, fontSize: 10 }}>
                      {typeLabels[evt.type]}
                    </div>
                  ))}
                  {events.length > 2 && <span className="text-xs" style={{ color: "#6B7280", fontSize: 10 }}>+{events.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: "1px solid #2A2A38" }}>
          {Object.entries(typeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: typeColors[type] }}/>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && eventsForDay(selected).length > 0 && (
        <div className="mt-4 rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
          <h3 className="font-semibold mb-3">
            {selected} de Setembro
            <span className="ml-2 text-sm font-normal" style={{ color: "#6B7280" }}>{eventsForDay(selected).length} evento(s)</span>
          </h3>
          <div className="flex flex-col gap-2">
            {eventsForDay(selected).map((evt, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "#0B0B0F" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: evt.color }}/>
                <span className="text-sm font-medium">{evt.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: `${evt.color}22`, color: evt.color }}>{typeLabels[evt.type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
