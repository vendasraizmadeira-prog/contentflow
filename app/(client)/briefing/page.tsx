"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const questions = [
  { id: "niche",       label: "Qual é o seu nicho/segmento?",         placeholder: "Ex: Beleza, alimentação saudável, moda..." },
  { id: "audience",   label: "Quem é seu público-alvo?",              placeholder: "Ex: Mulheres de 25-35 anos interessadas em beleza natural..." },
  { id: "tone",       label: "Qual é o tom de voz da marca?",         placeholder: "Ex: Descontraído, profissional, inspirador..." },
  { id: "goals",      label: "Quais são seus objetivos?",             placeholder: "Ex: Aumentar vendas, ganhar seguidores, fortalecer marca..." },
  { id: "competitors",label: "Quem são seus principais concorrentes?",placeholder: "Ex: @marcaX, @marcaY..." },
  { id: "differentials",label: "Quais são seus diferenciais?",        placeholder: "Ex: Produto artesanal, atendimento personalizado..." },
];

export default function Briefing() {
  const router = useRouter();
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("briefing_completed")
        .eq("id", user.id)
        .single();

      setIsFirstAccess(!profile?.briefing_completed);

      const { data: existing } = await supabase
        .from("briefing_answers")
        .select("question_id, answer")
        .eq("user_id", user.id);

      if (existing && existing.length > 0) {
        const map: Record<string, string> = {};
        existing.forEach((r: { question_id: string; answer: string }) => { map[r.question_id] = r.answer; });
        setAnswers(map);
        setSaved(true);
      }
    };
    load();
  }, []);

  const save = async () => {
    setError("");
    const supabase = createClient();

    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Sessão expirada. Faça login novamente."); return; }
      uid = user.id;
      setUserId(uid);
    }

    setSaving(true);

    const upserts = questions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => ({ user_id: uid!, question_id: q.id, answer: answers[q.id] }));

    if (upserts.length > 0) {
      const { error: ansErr } = await supabase
        .from("briefing_answers")
        .upsert(upserts, { onConflict: "user_id,question_id" });
      if (ansErr) { setError(ansErr.message); setSaving(false); return; }
    }

    const { error: profErr } = await supabase
      .from("profiles")
      .update({ briefing_completed: true })
      .eq("id", uid);

    if (profErr) { setError(profErr.message); setSaving(false); return; }

    setSaving(false);

    if (isFirstAccess) {
      router.push("/metricas");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      {isFirstAccess && (
        <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: "rgba(212,255,63,0.06)", border: "1px solid rgba(212,255,63,0.15)" }}>
          <p className="font-bold text-base mb-1">Bem-vindo ao ContentFlow! 🎉</p>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Antes de acessar o app, preencha o diagnóstico abaixo para que sua agência entenda a sua marca.
            Leva menos de 5 minutos!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Briefing</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Informações sobre sua marca</p>
        </div>
        {!isFirstAccess && saved && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "#22C55E" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            Salvo
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
        <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid #22223A" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,255,63,0.12)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <p className="font-semibold">DNA da Marca</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>Essas informações guiam toda a criação de conteúdo</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {questions.map(q => (
            <div key={q.id}>
              <label className="text-sm font-medium block mb-2">{q.label}</label>
              <textarea
                value={answers[q.id] || ""}
                onChange={e => { setAnswers({ ...answers, [q.id]: e.target.value }); setSaved(false); }}
                placeholder={q.placeholder}
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all"
                style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-xs px-3 py-2 rounded-xl" style={{ background: "#FF6B6B22", color: "#FF6B6B" }}>
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm mt-6 transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "#D4FF3F", color: "#0B0B0F" }}
        >
          {saving ? "Salvando..." : isFirstAccess ? "Concluir e acessar o app →" : saved ? "✓ Salvo" : "Salvar briefing"}
        </button>
      </div>
    </div>
  );
}
