"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type ClientProfile = {
  id: string;
  name: string;
  instagram: string;
  avatar: string;
  briefing_completed: boolean;
};

type BriefingAnswer = { question_id: string; answer: string };

const BRIEFING_LABELS: Record<string, string> = {
  niche: "Nicho / Segmento",
  audience: "Público-alvo",
  tone: "Tom de voz",
  goals: "Objetivos",
  competitors: "Concorrentes",
  differentials: "Diferenciais",
};

type ViewMode = "list" | "view";

export default function Briefings() {
  const [view, setView] = useState<ViewMode>("list");
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<BriefingAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, name, instagram, avatar, briefing_completed")
        .eq("role", "client")
        .order("name");
      setClients(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const openBriefing = async (clientId: string) => {
    setSelectedId(clientId);
    setLoadingAnswers(true);
    setView("view");
    const supabase = createClient();
    const { data } = await supabase
      .from("briefing_answers")
      .select("question_id, answer")
      .eq("user_id", clientId);
    setAnswers(data ?? []);
    setLoadingAnswers(false);
  };

  const selectedClient = clients.find((c) => c.id === selectedId);

  if (view === "view" && selectedClient) {
    const answersMap = Object.fromEntries(answers.map((a) => [a.question_id, a.answer]));

    return (
      <div className="p-4 md:p-6 max-w-2xl">
        <button onClick={() => setView("list")} className="flex items-center gap-2 mb-5 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span className="text-sm" style={{ color: "#6B7280" }}>Briefings</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          {selectedClient.avatar ? (
            <img src={selectedClient.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF" }}>
              {selectedClient.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg">{selectedClient.name}</h1>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {selectedClient.instagram} · {selectedClient.briefing_completed ? "Briefing respondido" : "Pendente"}
            </p>
          </div>
        </div>

        {loadingAnswers ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1A1A22", height: 80 }} />)}
          </div>
        ) : answers.length > 0 ? (
          <div className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
            <div className="flex flex-col gap-4">
              {Object.entries(BRIEFING_LABELS).map(([key, label]) =>
                answersMap[key] ? (
                  <div key={key}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#E5E7EB" }}>{answersMap[key]}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "#6B7280" }}>
            <p className="text-sm">Briefing ainda não respondido por este cliente.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h1 className="text-xl md:text-2xl font-bold mb-1">Briefings</h1>
      <p className="text-sm mb-5" style={{ color: "#6B7280" }}>Diagnóstico estratégico de cada cliente</p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#1A1A22", height: 80 }} />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#6B7280" }}>
          <p className="text-sm">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>
              <div className="flex items-center gap-3">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF" }}>
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{c.instagram || "—"}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: c.briefing_completed ? "#10B98122" : "#FBBF2422",
                    color: c.briefing_completed ? "#10B981" : "#FBBF24",
                  }}
                >
                  {c.briefing_completed ? "Respondido" : "Pendente"}
                </span>
              </div>

              {c.briefing_completed && (
                <button
                  onClick={() => openBriefing(c.id)}
                  className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ background: "rgba(123,77,255,0.12)", color: "#7B4DFF", border: "1px solid #7B4DFF33" }}
                >
                  Ver briefing →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
