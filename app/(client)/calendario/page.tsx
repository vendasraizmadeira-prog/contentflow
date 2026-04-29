"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type CalEvent = { id: string; title: string; type: string; event_date: string; event_time: string | null; };

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const typeColors: Record<string, string> = { post: "#D4FF3F", reel: "#7B4DFF", recording: "#FF6B6B", story: "#F59E0B" };
const typeLabels: Record<string, string> = { post: "Post", reel: "Reels", recording: "Gravação", story: "Stories" };

export default function Calendario() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<number | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const end = `${year}-${String(month + 1).padStart(2, "0")}-31`;

      const { data } = await supabase
        .from("calendar_events")
        .select("id,title,type,event_date,event_time")
        .eq("client_id", user.id)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date");

      setEvents(data ?? []);
      setLoading(false);
    })();
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const todayDay = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;

  const eventsForDay = (day: number) =>
    events.filter(e => {
      const d = new Date(e.event_date + "T12:00:00");
      return d.getDate() === day;
    });

  const selectedEvents = selected ? eventsForDay(selected) : [];

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold">Calendário</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Conteúdos e gravações agendadas</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #17172A" }}>
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #17172A" }}>
          <button
            onClick={prev}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            style={{ background: "#13132A", border: "1px solid #22223A" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A9A" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h2 className="font-bold text-base">{MONTHS[month]} {year}</h2>
          <button
            onClick={next}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            style={{ background: "#13132A", border: "1px solid #22223A" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A9A" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-3 pt-3">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: "#3A3A58" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dayEvts = eventsForDay(day);
            const isToday = day === todayDay;
            const isSel = selected === day;
            return (
              <div
                key={day}
                onClick={() => setSelected(day === selected ? null : day)}
                className="rounded-xl p-1.5 min-h-[52px] cursor-pointer select-none"
                style={{
                  background: isSel ? "rgba(212,255,63,0.08)" : "transparent",
                  border: isToday ? "1.5px solid rgba(212,255,63,0.4)" : "1.5px solid transparent",
                  transition: "background 120ms",
                }}
                onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span
                  className="text-xs font-semibold block mb-1"
                  style={{ color: isToday ? "#D4FF3F" : isSel ? "#E8E8FF" : "#9A9ABE" }}
                >
                  {day}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayEvts.slice(0, 2).map((evt, ei) => {
                    const color = typeColors[evt.type] ?? "#7B4DFF";
                    return (
                      <div key={ei} className="w-full h-1.5 rounded-full" style={{ background: color, opacity: 0.8 }} />
                    );
                  })}
                  {dayEvts.length > 2 && (
                    <div className="text-center" style={{ fontSize: 8, color: "#5A5A7A" }}>+{dayEvts.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3" style={{ borderTop: "1px solid #17172A" }}>
          {Object.entries(typeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: typeColors[type] }} />
              <span className="text-xs" style={{ color: "#5A5A7A" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="mt-4 rounded-2xl overflow-hidden" style={{ background: "#0F0F1E", border: "1px solid #17172A" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #17172A" }}>
            <p className="font-bold text-sm">{selected} de {MONTHS[month]}</p>
          </div>
          {loading ? (
            <div className="p-4"><div className="h-10 rounded-xl animate-pulse" style={{ background: "#13132A" }} /></div>
          ) : selectedEvents.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: "#3A3A58" }}>Nenhum evento neste dia</p>
            </div>
          ) : (
            <div>
              {selectedEvents.map((evt, i) => {
                const color = typeColors[evt.type] ?? "#7B4DFF";
                return (
                  <div
                    key={evt.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < selectedEvents.length - 1 ? "1px solid #17172A" : "none" }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{evt.title}</p>
                      {evt.event_time && <p className="text-xs" style={{ color: "#5A5A7A" }}>{evt.event_time}</p>}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0" style={{ background: `${color}18`, color }}>
                      {typeLabels[evt.type] ?? evt.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
