"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Client = { id: string; name: string };
type Schedule = {
  id: string;
  client_id: string;
  clientName: string;
  title: string;
  message: string;
  scheduled_at: string;
  sent: boolean;
};

export default function CronogramaPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [cliRes, schedRes] = await Promise.all([
        supabase.from("profiles").select("id, name").eq("role", "client").order("name"),
        supabase
          .from("push_schedules")
          .select("id, client_id, title, message, scheduled_at, sent, profiles!client_id(name)")
          .order("scheduled_at", { ascending: false })
          .limit(100),
      ]);

      const cliList = cliRes.data ?? [];
      setClients(cliList);
      if (cliList.length > 0) setClientId(cliList[0].id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSchedules((schedRes.data ?? []).map((s: any) => ({
        id: s.id,
        client_id: s.client_id,
        clientName: (Array.isArray(s.profiles) ? s.profiles[0]?.name : s.profiles?.name) ?? "—",
        title: s.title,
        message: s.message,
        scheduled_at: s.scheduled_at,
        sent: s.sent,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title.trim() || !message.trim() || !date || !time) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      const { data, error } = await supabase.from("push_schedules").insert({
        client_id: clientId,
        title: title.trim(),
        message: message.trim(),
        scheduled_at: scheduledAt,
        created_by: user?.id ?? null,
      }).select("id, client_id, title, message, scheduled_at, sent").single();

      if (error) throw error;

      const clientName = clients.find(c => c.id === clientId)?.name ?? "—";
      setSchedules(prev => [{ ...data, clientName }, ...prev]);
      setTitle("");
      setMessage("");
      setDate("");
      setTime("");
      showToast("Notificação agendada!");
    } catch {
      showToast("Erro ao agendar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    const supabase = createClient();
    await supabase.from("push_schedules").delete().eq("id", id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cronograma de Notificações</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
          Agende notificações push para seus clientes em datas e horários específicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleCreate} className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
          <p className="text-sm font-bold" style={{ color: "#A78BFA" }}>NOVA NOTIFICAÇÃO AGENDADA</p>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>CLIENTE</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>TÍTULO DA NOTIFICAÇÃO</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Hora de postar o story!"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>MENSAGEM</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ex: Publique o story do produto X agora! O engajamento está alto."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
              style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>DATA</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>HORÁRIO</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !clientId || !title.trim() || !message.trim() || !date || !time}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#7B4DFF", color: "#fff" }}
          >
            {saving ? "Agendando..." : "Agendar notificação"}
          </button>
        </form>

        {/* List */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold" style={{ color: "#9CA3AF" }}>AGENDAMENTOS ({schedules.length})</p>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse h-24" style={{ background: "#0F0F1E" }}/>
            ))
          ) : schedules.length === 0 ? (
            <div className="text-sm text-center py-10" style={{ color: "#4B5563" }}>
              Nenhum agendamento ainda
            </div>
          ) : (
            schedules.map(s => (
              <div
                key={s.id}
                className="rounded-2xl p-4"
                style={{
                  background: "#0F0F1E",
                  border: `1px solid ${s.sent ? "rgba(34,197,94,0.2)" : "#22223A"}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,77,255,0.15)", color: "#A78BFA" }}>
                        {s.clientName}
                      </span>
                      {s.sent ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                          ✓ Enviado
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}>
                          ⏰ Agendado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6B7280" }}>{s.message}</p>
                    <p className="text-xs mt-1.5 font-medium" style={{ color: "#818CF8" }}>
                      📅 {formatDate(s.scheduled_at)}
                    </p>
                  </div>
                  {!s.sent && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(239,68,68,0.1)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toast && (
        <div
          className="fixed z-50 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-sm font-semibold text-white"
          style={{ bottom: 30, background: "rgba(123,77,255,0.9)", backdropFilter: "blur(20px)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
