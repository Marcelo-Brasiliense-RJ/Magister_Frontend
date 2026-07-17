/*
 * Camada de dados de exibicao do painel admin (Magister).
 * Os tutores vem do backend real (lib/api). Aqui ficam so os tipos de exibicao,
 * o mapeamento API -> shape do painel e os dados de exemplo (Analitico/Docs),
 * que permanecem mock de proposito (o backend nao expoe metricas).
 */

import type { Tutor as ApiTutor } from '@/lib/types';

export type TintColor = 'teal' | 'violet' | 'amber' | 'rose' | 'green';
export type ModelId = 'auto' | 'fast' | 'strong';

export interface Tutor {
  id: number;
  name: string;
  desc: string;
  icon: string; // nome kebab do icone lucide
  color: TintColor;
  sources: number; // contagem exibida
  sourceUrls: string[];
  origins: string[];
  updated: string;
  active: boolean;
  fallback?: boolean; // true para o Reitor (is_fallback do backend)
  fallbackEnabled: boolean; // escala ao Reitor quando nao sabe (fallback_enabled)
  // metricas (mock, sem backend)
  conv: string;
  res: string;
  sat: string;
  tokens: string;
  cost: string;
  model: ModelId;
  slug: string;
  token: string; // embed token publico
  greet: string;
  q: string;
  a: string;
  instr?: string;
}

// Extras de exibicao por embed token dos tutores semeados: icone, cor e metricas
// de EXEMPLO. O backend nao expoe metricas; estes numeros sao dados de demonstracao,
// nao reais. Tutores criados pela UI caem no default (sem metricas).
interface DemoExtra {
  icon: string;
  color: TintColor;
  conv: string;
  res: string;
  sat: string;
  tokens: string;
  cost: string;
}

const DEMO_EXTRAS: Record<string, DemoExtra> = {
  tkn_9f2a7c41e0b3: { icon: 'graduation-cap', color: 'teal', conv: '512', res: '88%', sat: '4,7', tokens: '3,1M', cost: 'R$ 71,20' },
  tkn_3b7d15a0f2c9: { icon: 'life-buoy', color: 'violet', conv: '386', res: '84%', sat: '4,5', tokens: '2,0M', cost: 'R$ 48,60' },
  tkn_c1e884b6a7d2: { icon: 'book-marked', color: 'amber', conv: '128', res: '80%', sat: '4,3', tokens: '0,7M', cost: 'R$ 16,40' },
  tkn_a5f0d9e2b4c8: { icon: 'compass', color: 'green', conv: '241', res: '82%', sat: '4,4', tokens: '1,2M', cost: 'R$ 28,40' },
  tkn_reitor_1a2b3c: { icon: 'crown', color: 'teal', conv: '34', res: '—', sat: '4,6', tokens: '1,5M', cost: 'R$ 34,20' },
};

// Tempo relativo curto em pt-BR a partir de um ISO timestamp.
function relativeTime(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
}

// Mapeia o TutorRead do backend para o shape de exibicao do painel.
export function mapApiTutor(t: ApiTutor): Tutor {
  const x = DEMO_EXTRAS[t.embed_token];
  return {
    id: t.id,
    name: t.title,
    desc: t.description || 'sem descrição',
    icon: x?.icon ?? (t.is_fallback ? 'crown' : 'bot'),
    color: x?.color ?? 'teal',
    sources: t.sources.length,
    sourceUrls: t.sources,
    origins: t.allowed_origins,
    updated: relativeTime(t.updated_at),
    active: t.status === 'active',
    fallback: t.is_fallback,
    fallbackEnabled: t.fallback_enabled,
    conv: x?.conv ?? '—',
    res: x?.res ?? '—',
    sat: x?.sat ?? '—',
    tokens: x?.tokens ?? '—',
    cost: x?.cost ?? '—',
    model: 'auto',
    slug: t.embed_token,
    token: t.embed_token,
    greet: `Olá! Sou o ${t.title}. Como posso ajudar?`,
    q: 'Como você pode ajudar?',
    a: '',
    instr: t.system_instructions,
  };
}

// ---- Seletor de modelo (aba LLM) ----
export interface ModelOption {
  id: ModelId;
  name: string;
  sub?: string;
  tag?: string;
  desc: string;
  speed: number;
  econ: number;
  cap: number;
  ideal: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'auto',
    name: 'Automático',
    tag: 'Recomendado',
    desc: 'Deixa o Magister rotear por custo: tenta o Groq (mais barato) primeiro e cai no OpenRouter se ele falhar. Usa o modelo mais econômico nas perguntas simples e o mais capaz nas complexas, sem você pensar nisso.',
    speed: 3,
    econ: 4,
    cap: 3,
    ideal: 'a maioria dos tutores. Comece por aqui.',
  },
  {
    id: 'fast',
    name: 'Rápido & econômico',
    sub: 'Llama 3.1 8B',
    desc: 'Respostas quase instantâneas e custo mínimo, rodando no Groq. Ótimo para perguntas objetivas e grande volume de atendimento.',
    speed: 4,
    econ: 4,
    cap: 2,
    ideal: 'FAQs, prazos e respostas curtas e diretas.',
  },
  {
    id: 'strong',
    name: 'Mais capaz',
    sub: 'Llama 3.3 70B',
    desc: 'Mais raciocínio para instruções longas, muitas fontes e temas com nuance. Custo e latência maiores. É o modelo usado na tarefa de conversa (persona).',
    speed: 2,
    econ: 2,
    cap: 4,
    ideal: 'tutores com instruções detalhadas, várias fontes ou temas sensíveis.',
  },
];

// ---- Análises: series por periodo ----
export interface PeriodData {
  kpis: string[]; // conversas, mensagens, resolucao, resposta media, ... (8)
  tokens: string[]; // entrada, saida, total, custo/1k, custo total (5)
  labels: string[];
  conv: number[];
  msg: number[];
}

export const PERIODS: Record<'7' | '30' | '90', PeriodData> = {
  '7': {
    kpis: ['1.284', '7.940', '86%', '1,4s', '34', '4,6/5', 'R$ 182,40', '41.320'],
    tokens: ['5,8M', '2,3M', '41.320', 'R$ 0,14', 'R$ 182,40'],
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    conv: [42, 55, 48, 63, 58, 71, 66],
    msg: [268, 342, 301, 405, 362, 448, 414],
  },
  '30': {
    kpis: ['5.480', '33.900', '87%', '1,3s', '142', '4,6/5', 'R$ 742,60', '176.900'],
    tokens: ['24,6M', '9,8M', '176.900', 'R$ 0,14', 'R$ 742,60'],
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
    conv: [262, 318, 296, 341, 289],
    msg: [1580, 1910, 1786, 2050, 1740],
  },
  '90': {
    kpis: ['16.740', '102.300', '88%', '1,3s', '421', '4,7/5', 'R$ 2.238', '541.200'],
    tokens: ['74,1M', '29,4M', '541.200', 'R$ 0,13', 'R$ 2.238'],
    labels: ['Mês 1', 'Mês 2', 'Mês 3'],
    conv: [4980, 5320, 6440],
    msg: [30100, 32800, 39400],
  },
};

// ---- Histórico de conversas (modal) ----
export interface HistItem {
  q: string;
  from: string;
  out: 'fwd' | 'ok';
  outLabel: string;
  time: string;
}

export const HIST: HistItem[] = [
  { q: 'Vocês têm parceria de intercâmbio com universidades no exterior?', from: 'Suporte de Matrículas', out: 'fwd', outLabel: 'Encaminhada', time: 'há 12 min' },
  { q: 'Consigo trancar o semestre por motivo de saúde?', from: 'Ajuda Financeira', out: 'ok', outLabel: 'Resolvida', time: 'há 40 min' },
  { q: 'A biblioteca tem salas de estudo para reservar no fim de semana?', from: 'Guia da Biblioteca', out: 'ok', outLabel: 'Resolvida', time: 'há 1 h' },
  { q: 'Qual o procedimento para revisão de nota de uma prova?', from: 'Onboarding de Calouros', out: 'ok', outLabel: 'Resolvida', time: 'há 2 h' },
  { q: 'Posso pagar a matrícula com cartão de crédito internacional?', from: 'Suporte de Matrículas', out: 'fwd', outLabel: 'Encaminhada', time: 'há 3 h' },
  { q: 'Existe auxílio-moradia para alunos de outra cidade?', from: 'Ajuda Financeira', out: 'ok', outLabel: 'Resolvida', time: 'há 5 h' },
  { q: 'Como faço para emitir a carteirinha estudantil?', from: 'Onboarding de Calouros', out: 'ok', outLabel: 'Resolvida', time: 'ontem' },
  { q: 'O campus tem estacionamento para visitantes?', from: 'Guia da Biblioteca', out: 'fwd', outLabel: 'Encaminhada', time: 'ontem' },
];
