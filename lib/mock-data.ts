export const mockClient = {
  id: "1",
  name: "João Silva",
  instagram: "@lojaverde.oficial",
  avatar: "https://i.pravatar.cc/150?img=3",
  followers: 25400,
  following: 548,
  posts: 1243,
  followerGrowth: 2.3,
  warmthScore: 82,
};

export const mockMetrics = [
  { date: "01/09", followers: 23000 },
  { date: "08/09", followers: 23800 },
  { date: "15/09", followers: 24200 },
  { date: "22/09", followers: 24900 },
  { date: "30/09", followers: 25400 },
];

export const mockContents = [
  {
    id: "1245",
    type: "carousel",
    title: "Nova linha sustentável",
    status: "review",
    date: "10/09/2025",
    comments: 2,
    thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop",
    script: "🌿 Nova linha sustentável!\n\nFeia com ingredientes naturais, nossa nova linha cuida de você e do planeta.\n\n✅ 100% natural e vegano\n✅ Embalagem biodegradável\n✅ Sem crueldade animal\n\nDisponível em breve em nossa loja!\n\n#sustentável #natural #lojaverde",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop",
    ],
  },
  {
    id: "5678",
    type: "reel",
    title: "Bastidores da produção",
    status: "review",
    date: "09/09/2025",
    comments: 1,
    thumbnail: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&h=500&fit=crop",
    script: "Nos bastidores da nossa nova coleção! 🎬\n\nVeja como é feito o processo de criação dos nossos produtos.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: "1243",
    type: "post",
    title: "Hidratação natural",
    status: "approved",
    date: "02/10/2025",
    comments: 0,
    thumbnail: "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=300&h=300&fit=crop",
    script: "Sua pele merece o melhor! 💚\n\nNosso sérum hidratante com extrato de aloe vera cuida da sua pele de dentro para fora.",
    images: ["https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=600&h=600&fit=crop"],
  },
  {
    id: "1244",
    type: "carousel",
    title: "Ingredientes naturais",
    status: "scheduled",
    date: "04/10/2025",
    comments: 0,
    thumbnail: "https://images.unsplash.com/photo-1542601906897-eef9bd27d1d9?w=300&h=300&fit=crop",
    script: "Conheça os ingredientes que fazem a diferença! 🌿",
    images: [
      "https://images.unsplash.com/photo-1542601906897-eef9bd27d1d9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559181567-c3190f7fb52a?w=600&h=600&fit=crop",
    ],
  },
  {
    id: "9999",
    type: "reel",
    title: "Transformação",
    status: "approved",
    date: "05/10/2025",
    comments: 0,
    thumbnail: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&h=500&fit=crop",
    script: "Antes e depois do tratamento com nossa linha! ✨",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

export const mockNotifications = [
  { id: "1", title: "Post Carrossel pronto para revisão", message: "Cliente: Loja Verde", time: "há 5 min", read: false, type: "review" },
  { id: "2", title: "Gravação agendada para amanhã", message: "Cliente: Bella Modas — 09:00", time: "há 1 hora", read: false, type: "recording" },
  { id: "3", title: "Reels aprovado e agendado", message: "Cliente: Café & Prosa — 10/09", time: "há 3 horas", read: true, type: "approved" },
  { id: "4", title: "Novo briefing respondido", message: "Cliente: Academia Strong", time: "há 5 horas", read: true, type: "briefing" },
];

export const mockClients = [
  { id: "1", name: "Loja Verde", instagram: "@lojaverde.oficial", status: "active", followers: 25400, growth: 2.3, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "2", name: "Café & Prosa", instagram: "@cafe.prosa", status: "active", followers: 12800, growth: 1.1, avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "3", name: "Bella Modas", instagram: "@bellamodas", status: "active", followers: 8300, growth: 0.8, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "4", name: "Academia Strong", instagram: "@academiastrong", status: "active", followers: 15600, growth: 3.4, avatar: "https://i.pravatar.cc/150?img=12" },
];

export const mockCalendarEvents = [
  { date: 10, label: "Post Carrossel", client: "Loja Verde", type: "post", color: "#D4FF3F" },
  { date: 12, label: "Reels", client: "Café & Prosa", type: "reel", color: "#7B4DFF" },
  { date: 12, label: "Gravação", client: "Bella Modas", type: "recording", color: "#FF6B6B" },
  { date: 15, label: "Stories", client: "Bella Modas", type: "story", color: "#FFB347" },
  { date: 18, label: "Post", client: "Loja Verde", type: "post", color: "#D4FF3F" },
  { date: 24, label: "Post Carrossel", client: "Academia Strong", type: "post", color: "#D4FF3F" },
  { date: 25, label: "Gravação", client: "Café & Prosa", type: "recording", color: "#FF6B6B" },
  { date: 28, label: "Reels", client: "Bella Modas", type: "reel", color: "#7B4DFF" },
  { date: 30, label: "Stories", client: "Academia Strong", type: "story", color: "#FFB347" },
];

export const mockBriefings = [
  { id: "1", client: "Loja Verde", title: "Briefing inicial", status: "answered", date: "01/08/2025", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "2", client: "Bella Modas", title: "Campanha Verão", status: "answered", date: "28/08/2025", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "3", client: "Café & Prosa", title: "Novo Lançamento", status: "pending", date: "—", avatar: "https://i.pravatar.cc/150?img=8" },
  { id: "4", client: "Academia Strong", title: "Rebranding", status: "answered", date: "20/09/2025", avatar: "https://i.pravatar.cc/150?img=12" },
];

export const mockRecordings = [
  { id: "1", client: "Bella Modas", date: "02/10/2025", time: "09:00", location: "Estúdio A", status: "tomorrow" },
  { id: "2", client: "Café & Prosa", date: "03/10/2025", time: "14:00", location: "Estúdio B", status: "soon" },
  { id: "3", client: "Academia Strong", date: "06/10/2025", time: "10:00", location: "Academia", status: "later" },
];

export type RoteiroHistoryEntry = {
  id: string;
  timestamp: string;
  action: "criado" | "editado" | "aprovado";
  note: string;
  author: string;
};

export type Roteiro = {
  id: string;
  title: string;
  type: "post" | "reel" | "carousel" | "story";
  status: "pendente" | "revisado";
  content: string;
  createdAt: string;
  history: RoteiroHistoryEntry[];
};

export const mockRoteiros: Roteiro[] = [
  {
    id: "r1",
    title: "Lançamento Nova Linha",
    type: "carousel",
    status: "pendente",
    createdAt: "28/09/2025",
    content: `🌿 Nova linha sustentável chegou!\n\nSlide 1: Cover — "O futuro é verde"\n\nSlide 2: Apresentação dos produtos\nNossa nova linha conta com 5 produtos 100% naturais, formulados com ingredientes da biodiversidade brasileira.\n\nSlide 3: Ingredientes em destaque\n✅ Óleo de pracaxi\n✅ Extrato de cupuaçu\n✅ Vitamina C natural\n\nSlide 4: Benefícios\nHidratação profunda, proteção UV natural e textura leve para uso diário.\n\nSlide 5: CTA\n"Garanta o seu antes que acabe. Link na bio!"`,
    history: [
      { id: "h1", timestamp: "25/09/2025 10:22", action: "criado", note: "Roteiro criado pela agência.", author: "ContentFlow" },
    ],
  },
  {
    id: "r2",
    title: "Bastidores da Produção",
    type: "reel",
    status: "pendente",
    createdAt: "27/09/2025",
    content: `🎬 REELS — Bastidores\n\n[0:00–0:03] Abertura dinâmica com corte rápido — música animada\n[0:03–0:08] Câmera mostra mesa de trabalho → zoom out revela estúdio\n[0:08–0:15] Equipe trabalhando: embalando produtos, testando aromas\n[0:15–0:22] Close nos produtos sendo finalizados com cuidado artesanal\n[0:22–0:28] Equipe reunida levantando produto para câmera — sorrindo\n[0:28–0:30] Logo + CTA: "Feito com ❤️ para você"\n\nLegenda: "Por trás de cada produto existe muito amor e dedicação ✨ Conheça nossa história. Link na bio!"`,
    history: [
      { id: "h1", timestamp: "24/09/2025 14:10", action: "criado", note: "Roteiro inicial criado pela agência.", author: "ContentFlow" },
    ],
  },
  {
    id: "r3",
    title: "Dicas de Cuidado Diário",
    type: "carousel",
    status: "revisado",
    createdAt: "20/09/2025",
    content: `💚 5 Dicas para uma rotina de skincare natural\n\nSlide 1: "Sua pele agradece rotina" — foto lifestyle\n\nSlide 2: Dica 1 — Limpeza suave\nUse sabonete sem sulfatos, de preferência à noite para remover impurezas do dia.\n\nSlide 3: Dica 2 — Hidratação sempre\nAplique hidratante ainda com a pele levemente úmida para melhor absorção.\n\nSlide 4: Dica 3 — Proteção solar obrigatória\nFPS mínimo 30, mesmo em dias nublados e em casa.\n\nSlide 5: Nosso produto favorito\n"Sérum Natural Loja Verde — disponível no link da bio"`,
    history: [
      { id: "h1", timestamp: "15/09/2025 09:30", action: "criado", note: "Roteiro inicial com 5 dicas de skincare.", author: "ContentFlow" },
      { id: "h2", timestamp: "18/09/2025 11:15", action: "editado", note: "Adicionado produto da marca na dica 5 e melhorado CTA.", author: "João Silva" },
      { id: "h3", timestamp: "20/09/2025 16:45", action: "aprovado", note: "Aprovado sem alterações adicionais.", author: "João Silva" },
    ],
  },
  {
    id: "r4",
    title: "Depoimento de Cliente",
    type: "post",
    status: "revisado",
    createdAt: "18/09/2025",
    content: `⭐️⭐️⭐️⭐️⭐️ Resultado real de cliente real!\n\n"Depois de 30 dias usando o Sérum Natural, minha pele ficou visivelmente mais firme e luminosa. Não acreditava até ver no espelho!" — Ana Paula, SP\n\nResultados como esse nos motivam a continuar desenvolvendo produtos cada vez melhores 💚\n\n👉 Quer ter resultados assim também? O link está na bio.`,
    history: [
      { id: "h1", timestamp: "14/09/2025 08:00", action: "criado", note: "Post de depoimento criado.", author: "ContentFlow" },
      { id: "h2", timestamp: "18/09/2025 10:00", action: "aprovado", note: "Aprovado pelo cliente sem alterações.", author: "João Silva" },
    ],
  },
];
