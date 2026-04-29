import type { RoteiroHistoryEntry } from "./mock-data";

export type ClientActivity = {
  id: string;
  type: "roteiro" | "conteudo" | "briefing";
  message: string;
  time: string;
  unread: boolean;
};

export type Highlight = { id: string; title: string; cover: string };

export type AdminClient = {
  id: string;
  name: string;
  instagram: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
  growth: number;
  warmthScore: number;
  status: "active" | "inactive";
  bio: string;
  website: string;
  highlights: Highlight[];
  activity: ClientActivity[];
  unreadCount: number;
};

export type AdminRoteiro = {
  id: string;
  clientId: string;
  title: string;
  type: "post" | "reel" | "carousel" | "story";
  status: "rascunho" | "enviado" | "em_revisao" | "aprovado";
  content: string;
  createdAt: string;
  history: RoteiroHistoryEntry[];
  producaoId?: string;
};

export type ProducaoItem = {
  id: string;
  clientId: string;
  roteiroId: string;
  roteiroTitle: string;
  type: "post" | "reel" | "carousel" | "story";
  postSubtype: "single" | "carousel";
  status: "aguardando" | "em_revisao" | "aprovado" | "agendado";
  images: string[];
  caption: string;
  scheduledDate: string;
  createdAt: string;
};

export const adminClients: AdminClient[] = [];

const _mockAdminClients: AdminClient[] = [
  {
    id: "1",
    name: "Loja Verde",
    instagram: "@lojaverde.oficial",
    avatar: "https://i.pravatar.cc/150?img=3",
    followers: 25400,
    following: 548,
    posts: 1243,
    growth: 2.3,
    warmthScore: 82,
    status: "active",
    bio: "🌿 Produtos naturais e veganos\n💚 Entrega para todo Brasil\n👇 Compre pelo link",
    website: "lojaverde.com.br",
    highlights: [
      { id: "h1", title: "Produtos", cover: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=120&h=120&fit=crop" },
      { id: "h2", title: "Promos", cover: "https://images.unsplash.com/photo-1542601906897-eef9bd27d1d9?w=120&h=120&fit=crop" },
      { id: "h3", title: "Reviews", cover: "https://images.unsplash.com/photo-1559181567-c3190f7fb52a?w=120&h=120&fit=crop" },
    ],
    activity: [
      { id: "a1", type: "roteiro", message: "Roteiro 'Lançamento Nova Linha' aprovado", time: "5 min", unread: true },
      { id: "a2", type: "conteudo", message: "Post 'Hidratação natural' solicitou alterações", time: "1 hora", unread: true },
    ],
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Café & Prosa",
    instagram: "@cafe.prosa",
    avatar: "https://i.pravatar.cc/150?img=8",
    followers: 12800,
    following: 340,
    posts: 512,
    growth: 1.1,
    warmthScore: 64,
    status: "active",
    bio: "☕ O melhor café da cidade\n📍 Rua das Flores, 123\n⏰ Seg-Sex 7h–22h",
    website: "cafeprosa.com.br",
    highlights: [
      { id: "h1", title: "Menu", cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&h=120&fit=crop" },
      { id: "h2", title: "Eventos", cover: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=120&h=120&fit=crop" },
    ],
    activity: [
      { id: "a1", type: "roteiro", message: "Roteiro 'Bastidores' em revisão pelo cliente", time: "2 horas", unread: false },
    ],
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Bella Modas",
    instagram: "@bellamodas",
    avatar: "https://i.pravatar.cc/150?img=5",
    followers: 8300,
    following: 212,
    posts: 289,
    growth: 0.8,
    warmthScore: 55,
    status: "active",
    bio: "👗 Moda feminina exclusiva\n✨ Novas peças toda semana\n🛍️ Frete grátis acima de R$299",
    website: "bellamodas.com.br",
    highlights: [
      { id: "h1", title: "Inverno 25", cover: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=120&h=120&fit=crop" },
    ],
    activity: [],
    unreadCount: 0,
  },
  {
    id: "4",
    name: "Academia Strong",
    instagram: "@academiastrong",
    avatar: "https://i.pravatar.cc/150?img=12",
    followers: 15600,
    following: 892,
    posts: 764,
    growth: 3.4,
    warmthScore: 91,
    status: "active",
    bio: "💪 Transformação começa aqui\n🏋️ Musculação | Funcional | Cardio\n📍 São Paulo — SP",
    website: "academiastrong.com.br",
    highlights: [
      { id: "h1", title: "Alunos", cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop" },
      { id: "h2", title: "Treinos", cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&h=120&fit=crop" },
    ],
    activity: [
      { id: "a1", type: "briefing", message: "Briefing de diagnóstico respondido pelo cliente", time: "1 dia", unread: true },
    ],
    unreadCount: 1,
  },
];

export const adminRoteiros: AdminRoteiro[] = [];

const _mockAdminRoteiros: AdminRoteiro[] = [
  {
    id: "ar1", clientId: "1", title: "Lançamento Nova Linha", type: "carousel", status: "aprovado",
    content: `🌿 Nova linha sustentável chegou!\n\nSlide 1: Cover — "O futuro é verde"\n\nSlide 2: Apresentação dos produtos\nNossa nova linha conta com 5 produtos 100% naturais, formulados com ingredientes da biodiversidade brasileira.\n\nSlide 3: Ingredientes em destaque\n✅ Óleo de pracaxi\n✅ Extrato de cupuaçu\n✅ Vitamina C natural\n\nSlide 4: CTA\n"Garanta o seu antes que acabe. Link na bio!"`,
    createdAt: "25/09/2025",
    history: [
      { id: "h1", timestamp: "25/09/2025 10:22", action: "criado", note: "Roteiro criado pela agência.", author: "ContentFlow" },
      { id: "h2", timestamp: "28/09/2025 16:45", action: "aprovado", note: "Aprovado pelo cliente sem alterações.", author: "João Silva" },
    ],
    producaoId: "p1",
  },
  {
    id: "ar2", clientId: "1", title: "Bastidores da Produção", type: "reel", status: "enviado",
    content: `🎬 REELS — Bastidores\n\n[0:00–0:03] Abertura dinâmica com corte rápido\n[0:03–0:08] Câmera mostra mesa de trabalho → zoom revela estúdio\n[0:08–0:15] Equipe trabalhando: embalando, testando\n[0:15–0:22] Close nos produtos sendo finalizados\n[0:22–0:28] Equipe reunida levantando produto\n[0:28–0:30] Logo + CTA: "Feito com ❤️ para você"`,
    createdAt: "27/09/2025",
    history: [
      { id: "h1", timestamp: "27/09/2025 14:10", action: "criado", note: "Roteiro inicial criado.", author: "ContentFlow" },
    ],
  },
  {
    id: "ar3", clientId: "2", title: "Menu de Outono", type: "carousel", status: "rascunho",
    content: `☕ Novos sabores de outono!\n\nSlide 1: Cover — "Chegou o outono no Café & Prosa"\nSlide 2: Capuccino especial com canela e cardamomo\nSlide 3: Bolo de especiarias da casa\nSlide 4: Combo com 15% de desconto`,
    createdAt: "29/09/2025",
    history: [
      { id: "h1", timestamp: "29/09/2025 09:00", action: "criado", note: "Rascunho inicial.", author: "ContentFlow" },
    ],
  },
  {
    id: "ar4", clientId: "4", title: "Transformação em 30 dias", type: "reel", status: "aprovado",
    content: `💪 REELS — Transformação\n\n[0:00–0:05] Antes: aluno no primeiro dia\n[0:05–0:15] Jornada: treinos e dedicação\n[0:15–0:25] Depois: resultado real\n[0:25–0:30] CTA: "Comece hoje. Link na bio"`,
    createdAt: "20/09/2025",
    history: [
      { id: "h1", timestamp: "20/09/2025 08:00", action: "criado", note: "Roteiro criado.", author: "ContentFlow" },
      { id: "h2", timestamp: "22/09/2025 10:00", action: "aprovado", note: "Cliente aprovou.", author: "Academia Strong" },
    ],
    producaoId: "p2",
  },
];

export const producaoItems: ProducaoItem[] = [];

const _mockProducaoItems: ProducaoItem[] = [
  {
    id: "p1", clientId: "1", roteiroId: "ar1", roteiroTitle: "Lançamento Nova Linha",
    type: "carousel", postSubtype: "carousel", status: "em_revisao",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop",
    ],
    caption: "🌿 Nova linha sustentável chegou! Ingredientes 100% naturais. Link na bio!",
    scheduledDate: "10/10/2025",
    createdAt: "30/09/2025",
  },
  {
    id: "p2", clientId: "4", roteiroId: "ar4", roteiroTitle: "Transformação em 30 dias",
    type: "reel", postSubtype: "single", status: "aguardando",
    images: [], caption: "", scheduledDate: "", createdAt: "23/09/2025",
  },
];
