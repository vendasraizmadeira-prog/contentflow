"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClientOption = { id: string; name: string };

const types = [
  { key: "post",     label: "Post",      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "carousel", label: "Carrossel", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { key: "reel",     label: "Reels",     icon: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { key: "story",    label: "Story",     icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

export default function NovoConteudo() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [type, setType] = useState("post");
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    createClient().from("profiles").select("id, name").eq("role", "client").order("name")
      .then(({ data }) => {
        const list = data ?? [];
        setClients(list);
        if (list.length > 0) setClientId(list[0].id);
      });
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const submit = async (draft = false) => {
    if (!clientId || !title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("producao_items").insert({
      client_id: clientId,
      roteiro_title: title.trim(),
      type,
      post_subtype: type === "carousel" ? "carousel" : "single",
      status: draft ? "aguardando" : "em_revisao",
      images: previews,
      caption: caption.trim(),
      scheduled_date: date || null,
    });
    setSaving(false);
    router.push("/admin/conteudos");
  };

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-sm" style={{ color: "#9CA3AF" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Novo Conteúdo</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>TIPO DE CONTEÚDO</p>
            <div className="grid grid-cols-4 gap-2">
              {types.map(t => (
                <button key={t.key} onClick={() => setType(t.key)} className="py-3 rounded-xl flex flex-col items-center gap-1.5 transition-all" style={{
                  background: type === t.key ? "rgba(123,77,255,0.15)" : "#0B0B0F",
                  border: `1px solid ${type === t.key ? "#7B4DFF" : "#22223A"}`,
                  color: type === t.key ? "#7B4DFF" : "#6B7280",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon}/></svg>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <p className="text-xs font-medium mb-3" style={{ color: "#9CA3AF" }}>MÍDIA</p>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="hidden"/>
            {previews.length === 0 ? (
              <div onClick={() => fileRef.current?.click()} className="rounded-xl flex flex-col items-center justify-center cursor-pointer p-8 transition-all hover:opacity-80" style={{ background: "#0B0B0F", border: "2px dashed #22223A" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <p className="text-sm mt-2" style={{ color: "#6B7280" }}>Clique para fazer upload</p>
                <p className="text-xs mt-1" style={{ color: "#4B5563" }}>PNG, JPG, MP4 até 500MB</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-square relative">
                    <img src={p} alt="" className="w-full h-full object-cover"/>
                    <button onClick={() => setPreviews(previews.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                <div onClick={() => fileRef.current?.click()} className="rounded-xl flex items-center justify-center cursor-pointer aspect-square" style={{ background: "#0B0B0F", border: "2px dashed #22223A" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: "#0F0F1E", border: "1px solid #22223A" }}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>CLIENTE</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>TÍTULO</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do conteúdo" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}/>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>LEGENDA / ROTEIRO</label>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Escreva a legenda ou roteiro..." rows={5} className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}/>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#9CA3AF" }}>DATA DE PUBLICAÇÃO</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: "#0B0B0F", border: "1px solid #22223A", color: "#fff" }}/>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => submit(true)} disabled={saving || !clientId || !title.trim()} className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-40" style={{ border: "1px solid #22223A", color: "#fff" }}>
              {saving ? "Salvando..." : "Salvar rascunho"}
            </button>
            <button onClick={() => submit(false)} disabled={saving || !clientId || !title.trim()} className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40" style={{ background: "#7B4DFF", color: "#fff" }}>
              {saving ? "Enviando..." : "Enviar para revisão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
