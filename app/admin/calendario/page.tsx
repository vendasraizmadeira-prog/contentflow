"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const HOURS = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`);

type ClientOption = { id: string; name: string };
type CalendarEvent = { id: string; title: string; date: number; month: number; year: number; time: string; clientId: string; clientName: string; type: string };
const typeColors: Record<string, string> = { recording: "#FF6B6B", post: "#D4FF3F", reel: "#7B4DFF", story: "#FFB347" };
const typeLabels: Record<string, string> = { recording: "Gravação", post: "Post", reel: "Reels", story: "Stories" };

export default function AdminCalendario() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filterClient, setFilterClient] = useState("all");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", time: "09:00", clientId: "", type: "recording" });
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  useEffect(() => {
    const loadClients = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("id, name").eq("role", "client").order("name");
      const list = data ?? [];
      setClients(list);
      if (list.length > 0) setForm(f => ({ ...f, clientId: list[0].id }));
    };
    loadClients();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      const supabase = createClient();
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const { data } = await supabase
        .from("calendar_events")
        .select("id, title, type, event_date, event_time, client_id, profiles!client_id(name)")
        .gte("event_date", startDate)
        .lte("event_date", endDate);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEvents((data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.event_date + "T12:00:00").getDate(),
        month: new Date(e.event_date + "T12:00:00").getMonth(),
        year: new Date(e.event_date + "T12:00:00").getFullYear(),
        time: e.event_time ?? "",
        clientId: e.client_id,
        clientName: (Array.isArray(e.profiles) ? e.profiles[0]?.name : e.profiles?.name) ?? "",
        type: e.type,
      })));
    };
    loadEvents();
  }, [year, month]);

  const openSchedule = (day: number) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const scheduleEvent = async () => {
    if (!form.title.trim() || !form.clientId) return;
    setSaving(true);
    const supabase = createClient();
    const eventDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const { data, error } = await supabase.from("calendar_events").insert({
      client_id: form.clientId,
      title: form.title,
      type: form.type,
      event_date: eventDate,
      event_time: form.time,
    }).select("id").single();

    if (!error && data) {
      const client = clients.find((c) => c.id === form.clientId);
      const newEvent: CalendarEvent = {
        id: data.id,
        title: form.title,
        date: selectedDay!,
        month,
        year,
        time: form.time,
        clientId: form.clientId,
        clientName: client?.name ?? "",
        type: form.type,
      };
      setEvents(prev => [...prev, newEvent]);
      const clientName = client?.name ?? "";
      setToast(`${typeLabels[form.type] ?? form.type} agendado! Notificação enviada para ${clientName}`);
      setTimeout(() => setToast(""), 3000);
    }
    setForm(f => ({ ...f, title: "" }));
    setShowModal(false);
    setSaving(false);
  };

  const getEventsForDay = (day: number) =>
    events.filter((e) => e.date === day && e.month === month && e.year === year && (filterClient === "all" || e.clientId === filterClient));

  const formatDate = (day: number) => {
    const d = new Date(year, month, day);
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Agenda</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Calendário de gravações e publicações</p>
        </div>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none flex-shrink-0"
          style={{ background: "#1A1A22", border: "1px solid #2A2A38", color: "#fff" }}
        >
          <option value="all">Todos</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="rounded-2xl p-4 md:p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#0B0B0F" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="font-bold text-base md:text-lg">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#0B0B0F" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-1.5" style={{ color: "#6B7280" }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const isToday = isCurrentMonth && day === today.getDate();
            const dayEvts = getEventsForDay(day);
            return (
              <button
                key={day}
                onClick={() => openSchedule(day)}
                className="rounded-xl p-1.5 md:p-2 min-h-14 md:min-h-20 text-left transition-all active:scale-[0.96]"
                style={{ background: "#0B0B0F", border: isToday ? "1.5px solid #7B4DFF" : "1px solid #2A2A38" }}
              >
                <span className="text-xs font-semibold" style={{ color: isToday ? "#7B4DFF" : "#9CA3AF" }}>{day}</span>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {dayEvts.slice(0, 2).map((evt) => {
                    const color = typeColors[evt.type] ?? "#7B4DFF";
                    return (
                      <div key={evt.id} className="rounded px-1 py-0.5" style={{ background: `${color}22` }}>
                        <p className="truncate" style={{ color, fontSize: 8, fontWeight: 600 }}>{typeLabels[evt.type] ?? evt.type}</p>
                        <p className="truncate" style={{ color, fontSize: 7, opacity: 0.7 }}>{evt.clientName.split(" ")[0]}</p>
                      </div>
                    );
                  })}
                  {dayEvts.length > 2 && (
                    <span style={{ fontSize: 8, color: "#6B7280" }}>+{dayEvts.length - 2}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #2A2A38" }}>
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: "#9CA3AF" }}>{typeLabels[type]}</span>
            </div>
          ))}
          <span className="text-xs ml-auto" style={{ color: "#4B5563" }}>Toque em qualquer dia para agendar</span>
        </div>
      </div>

      {showModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4 md:hidden" style={{ background: "#2A2A38" }} />
            <h3 className="font-bold text-lg mb-1">Agendar evento</h3>
            <p className="text-xs mb-5" style={{ color: "#7B4DFF" }}>{formatDate(selectedDay)}</p>

            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>TÍTULO</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Gravação produto novo" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>TIPO</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>HORÁRIO</label>
                <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>CLIENTE</label>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm" style={{ border: "1px solid #2A2A38", color: "#9CA3AF" }}>Cancelar</button>
              <button onClick={scheduleEvent} disabled={!form.title.trim() || saving} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40" style={{ background: "#FF6B6B", color: "#fff" }}>
                {saving ? "Salvando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 px-4 py-3 rounded-2xl text-sm font-semibold text-center" style={{ background: "#10B981", color: "#fff" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
