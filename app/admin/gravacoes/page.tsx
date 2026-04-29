"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Recording = { id: string; clientName: string; date: string; time: string; location: string };
type ClientOption = { id: string; name: string };

const HOURS = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`);

function getStatus(dateStr: string) {
  if (!dateStr) return "later";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff <= 1) return "tomorrow";
  if (diff <= 3) return "soon";
  return "later";
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  tomorrow: { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", label: "Amanhã" },
  soon:     { bg: "rgba(129,140,248,0.15)", color: "#818CF8", label: "Em breve" },
  later:    { bg: "rgba(107,114,128,0.15)", color: "#9CA3AF", label: "Agendado" },
};

export default function Gravacoes() {
  const [showNew, setShowNew] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clientId: "", date: "", time: "09:00", location: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [evtRes, cliRes] = await Promise.all([
        supabase.from("calendar_events")
          .select("id, title, event_date, event_time, client_id, profiles!client_id(name)")
          .eq("type", "recording")
          .order("event_date"),
        supabase.from("profiles").select("id, name").eq("role", "client").order("name"),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRecordings((evtRes.data ?? []).map((e: any) => ({
        id: e.id,
        clientName: (Array.isArray(e.profiles) ? e.profiles[0]?.name : e.profiles?.name) ?? "—",
        date: e.event_date ?? "",
        time: e.event_time ?? "",
        location: e.title ?? "",
      })));

      const cliList = cliRes.data ?? [];
      setClients(cliList);
      if (cliList.length > 0) setForm(f => ({ ...f, clientId: cliList[0].id }));
      setLoading(false);
    };
    load();
  }, []);

  const create = async () => {
    if (!form.clientId || !form.date) return;
    setSaving(true);
    const client = clients.find(c => c.id === form.clientId);
    const supabase = createClient();
    const { data, error } = await supabase.from("calendar_events").insert({
      client_id: form.clientId,
      title: form.location || `Gravação — ${client?.name ?? ""}`,
      type: "recording",
      event_date: form.date,
      event_time: form.time,
    }).select("id").single();

    if (!error && data) {
      setRecordings(prev => [...prev, {
        id: data.id,
        clientName: client?.name ?? "",
        date: form.date,
        time: form.time,
        location: form.location || "",
      }]);
    }
    setSaving(false);
    setShowNew(false);
    setForm(f => ({ ...f, date: "", location: "" }));
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gravações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Agende e gerencie datas de gravação</p>
        </div>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: "#7B4DFF", color: "#fff" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Agendar gravação
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1A1A22", height: 72 }} />)}
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhuma gravação agendada.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recordings.map(r => {
            const s = statusStyles[getStatus(r.date)];
            return (
              <div key={r.id} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,107,0.15)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{r.clientName}</p>
                  <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>{r.date ? new Date(r.date + "T12:00:00").toLocaleDateString("pt-BR") : "—"} — {r.time}</p>
                  {r.location && <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>📍 {r.location}</p>}
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <h3 className="font-bold mb-4">Agendar Gravação</h3>
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>CLIENTE</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>DATA</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}/>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>HORÁRIO</label>
                  <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>LOCAL</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Estúdio A, local do cliente..." className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: "1px solid #2A2A38" }}>Cancelar</button>
              <button onClick={create} disabled={saving || !form.clientId || !form.date} className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: "#7B4DFF", color: "#fff" }}>
                {saving ? "Salvando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
