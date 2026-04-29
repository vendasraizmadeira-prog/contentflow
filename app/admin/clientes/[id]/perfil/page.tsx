"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Highlight = { id: string; title: string; cover: string };

export default function PerfilEditor() {
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [posts, setPosts] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // For adding a new highlight
  const [newHL, setNewHL] = useState("");
  const [newHLCover, setNewHLCover] = useState<string | null>(null);
  const newHLCoverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Per-highlight cover update refs
  const hlRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("name, instagram, avatar, bio, website, followers, following, posts, highlights")
        .eq("id", id)
        .single();

      if (data) {
        setDisplayName(data.name ?? "");
        setUsername((data.instagram ?? "").replace("@", ""));
        setBio(data.bio ?? "");
        setWebsite(data.website ?? "");
        setAvatar(data.avatar ?? "");
        setFollowers(data.followers ?? 0);
        setFollowing(data.following ?? 0);
        setPosts(data.posts ?? 0);
        setHighlights(data.highlights ?? []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAvatar(URL.createObjectURL(f));
  };

  const handleNewHLCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setNewHLCover(URL.createObjectURL(f));
  };

  const handleHLCoverUpdate = (hlId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setHighlights((prev) => prev.map((h) => h.id === hlId ? { ...h, cover: url } : h));
  };

  const addHL = () => {
    if (!newHL.trim()) return;
    const cover = newHLCover ?? "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=120&h=120&fit=crop";
    setHighlights([...highlights, { id: `h${Date.now()}`, title: newHL.trim(), cover }]);
    setNewHL("");
    setNewHLCover(null);
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: displayName,
        instagram: username ? `@${username.replace("@", "")}` : "",
        bio,
        website,
        avatar,
        followers,
        following,
        posts,
        highlights,
      })
      .eq("id", id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(error.message);
    }
  };

  const bioLines = bio.split("\n");

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "#6B7280" }}>Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold mb-5">Perfil Instagram</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Form */}
        <div className="flex-1">
          <div className="rounded-2xl p-5" style={{ background: "#1A1A22", border: "1px solid #2A2A38" }}>

            {/* Avatar */}
            <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>FOTO DE PERFIL</p>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover" style={{ border: "2px solid #2A2A38" }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#7B4DFF22", color: "#7B4DFF", border: "2px solid #2A2A38" }}>
                    {displayName.charAt(0) || "?"}
                  </div>
                )}
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#7B4DFF" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </div>
              <div>
                <p className="text-sm font-medium">{displayName || "—"}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>@{username || "handle"}</p>
                <button onClick={() => avatarRef.current?.click()} className="text-xs mt-2" style={{ color: "#7B4DFF" }}>Alterar foto</button>
              </div>
            </div>

            {/* Fields */}
            {[
              { label: "NOME DE EXIBIÇÃO", value: displayName, set: setDisplayName, placeholder: "Nome da marca" },
              { label: "USUÁRIO (sem @)", value: username, set: setUsername, placeholder: "nomedeusuario" },
              { label: "WEBSITE", value: website, set: setWebsite, placeholder: "seusite.com.br" },
            ].map((f) => (
              <div key={f.label} className="mb-4">
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>{f.label}</label>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                />
              </div>
            ))}

            {/* Stats row */}
            <div className="flex gap-3 mb-4">
              {[
                { label: "SEGUIDORES", value: followers, set: setFollowers },
                { label: "SEGUINDO", value: following, set: setFollowing },
                { label: "POSTS", value: posts, set: setPosts },
              ].map((f) => (
                <div key={f.label} className="flex-1">
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#9CA3AF" }}>{f.label}</label>
                  <input
                    type="number"
                    value={f.value}
                    onChange={(e) => f.set(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                  />
                </div>
              ))}
            </div>

            {/* Bio */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: "#9CA3AF" }}>BIO</label>
                <span className="text-xs" style={{ color: bio.length > 140 ? "#FF6B6B" : "#6B7280" }}>{bio.length}/150</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                rows={4}
                placeholder={"Emojis e linhas funcionam!\n💚 Sobre a marca\n📍 Localização\n👇 CTA"}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
              />
            </div>

            {/* Highlights */}
            <div className="mb-5">
              <label className="text-xs font-semibold block mb-3" style={{ color: "#9CA3AF" }}>DESTAQUES</label>

              {/* Existing highlights with cover update */}
              {highlights.length > 0 && (
                <div className="flex gap-3 flex-wrap mb-3">
                  {highlights.map((h) => (
                    <div key={h.id} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <label htmlFor={`hl-cover-${h.id}`} className="block cursor-pointer">
                          <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: "2px solid #2A2A38" }}>
                            <img src={h.cover} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#7B4DFF" }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                          </div>
                        </label>
                        <input
                          id={`hl-cover-${h.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => { hlRefs.current[h.id] = el; }}
                          onChange={(e) => handleHLCoverUpdate(h.id, e)}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                        <button
                          onClick={() => setHighlights(highlights.filter((x) => x.id !== h.id))}
                          style={{ color: "#6B7280" }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new highlight */}
              <div className="flex gap-2 items-end">
                {/* Cover picker for new highlight */}
                <div className="flex-shrink-0">
                  <label
                    htmlFor="new-hl-cover"
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                    style={{ background: newHLCover ? "transparent" : "#0B0B0F", border: `2px dashed ${newHLCover ? "#7B4DFF" : "#2A2A38"}` }}
                  >
                    {newHLCover ? (
                      <img src={newHLCover} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                    )}
                  </label>
                  <input id="new-hl-cover" ref={newHLCoverRef} type="file" accept="image/*" onChange={handleNewHLCover} className="hidden" />
                </div>
                <input
                  value={newHL}
                  onChange={(e) => setNewHL(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHL()}
                  placeholder="Título do destaque"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#0B0B0F", border: "1px solid #2A2A38", color: "#fff" }}
                />
                <button onClick={addHL} className="px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0" style={{ background: "#7B4DFF", color: "#fff" }}>
                  Adicionar
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#4B5563" }}>Clique no círculo para escolher a imagem do destaque</p>
            </div>

            {saveError && (
              <p className="mb-3 text-xs px-3 py-2 rounded-xl" style={{ background: "#FF6B6B22", color: "#FF6B6B" }}>{saveError}</p>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-60"
              style={{ background: saved ? "#10B981" : "#7B4DFF", color: "#fff" }}
            >
              {saving ? "Salvando..." : saved ? "✓ Perfil salvo e enviado ao cliente" : "Salvar e enviar para visualização"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:w-80 flex-shrink-0">
          <p className="text-xs font-semibold mb-3" style={{ color: "#9CA3AF" }}>PRÉVIA DO PERFIL</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#000", border: "1px solid #2A2A38" }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-sm font-bold text-white">@{username || "username"}</span>
              <div className="flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-5 mb-3">
                {avatar ? (
                  <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" style={{ border: "2px solid #333" }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: "#1A1A22", color: "#7B4DFF", border: "2px solid #333" }}>
                    {displayName.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex gap-4 text-center">
                  {[{ n: posts, l: "posts" }, { n: followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers, l: "seguidores" }, { n: following, l: "seguindo" }].map(s => (
                    <div key={s.l}>
                      <p className="text-sm font-bold text-white">{s.n}</p>
                      <p className="text-xs text-gray-400">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm font-semibold text-white mb-1">{displayName || "Nome"}</p>
              <div className="mb-1">
                {bioLines.map((line, i) => (
                  <p key={i} className="text-xs text-white leading-relaxed">{line || " "}</p>
                ))}
              </div>
              {website && <p className="text-xs font-semibold" style={{ color: "#A78BFA" }}>{website}</p>}

              {highlights.length > 0 && (
                <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                  {highlights.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: "2px solid #333" }}>
                        <img src={h.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-white text-center truncate w-14">{h.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-px" style={{ background: "#111" }}>
              {[
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1542601906897-eef9bd27d1d9?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1559181567-c3190f7fb52a?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=200&h=200&fit=crop",
              ].map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
