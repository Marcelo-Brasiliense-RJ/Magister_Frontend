/*
 * Camada de dados do painel admin (Magister).
 * Espelha o mock in-memory do design do Claude Design. As funcoes sao async
 * de proposito: o formato imita um servico, entao trocar por api.ts (backend
 * real) depois e uma mudanca localizada. Hoje os dados vivem em memoria.
 */

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
  fallback?: boolean; // true para o Reitor (agente de escalonamento)
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

const SAMPLE_SOURCES = [
  'https://universidade.edu/matriculas',
  'https://universidade.edu/faq',
  'https://universidade.edu/calendario',
];
const SAMPLE_ORIGINS = ['https://universidade.edu.br', 'https://portal.universidade.edu.br'];

// Seed: 4 tutores de topico + o Reitor (fallback, id 99).
const SEED: Tutor[] = [
  {
    id: 1,
    name: 'Suporte de Matrículas',
    desc: 'Dúvidas sobre inscrição 2026',
    icon: 'graduation-cap',
    color: 'teal',
    sources: 8,
    sourceUrls: SAMPLE_SOURCES,
    origins: SAMPLE_ORIGINS,
    updated: 'há 2 h',
    active: true,
    conv: '512',
    res: '88%',
    sat: '4,7',
    tokens: '3,1M',
    cost: 'R$ 71,20',
    model: 'fast',
    slug: '9f2a7c41',
    token: 'tkn_9f2a7c41e0b3',
    greet: 'Olá! Posso ajudar com dúvidas sobre a matrícula 2026. O que você precisa?',
    q: 'Qual o prazo de inscrição?',
    a: 'As inscrições vão até <b>28 de fevereiro</b>. Quer o link do formulário?',
    instr:
      'Você é o "Suporte de Matrículas", tutor oficial de dúvidas sobre o processo de inscrição 2026. Responda de forma cordial, objetiva e em frases curtas, sempre com base nas fontes cadastradas (edital, calendário acadêmico e FAQ de matrículas). Cubra: prazos e etapas da inscrição, documentos exigidos, preenchimento e envio do formulário, formas de pagamento da taxa, isenções e como acompanhar o status. Ao citar datas, valores ou exigências, use exatamente o que estiver nas fontes, nunca estime nem invente. Se a dúvida fugir do escopo de matrícula (por exemplo bolsas, biblioteca ou grade curricular), diga que o assunto é de outro tutor e ofereça encaminhar. Quando a informação não estiver nas fontes, seja honesto sobre a lacuna e oriente o aluno a procurar a secretaria acadêmica ou abrir um chamado. Não solicite nem registre dados sensíveis como CPF, senha ou dados bancários pelo chat.',
  },
  {
    id: 2,
    name: 'Ajuda Financeira',
    desc: 'Bolsas e financiamento estudantil',
    icon: 'life-buoy',
    color: 'violet',
    sources: 12,
    sourceUrls: SAMPLE_SOURCES,
    origins: SAMPLE_ORIGINS,
    updated: 'ontem',
    active: true,
    conv: '386',
    res: '84%',
    sat: '4,5',
    tokens: '2,0M',
    cost: 'R$ 48,60',
    model: 'auto',
    slug: '3b7d15a0',
    token: 'tkn_3b7d15a0f2c9',
    greet: 'Oi! Tiro dúvidas sobre bolsas e financiamento estudantil. Como posso ajudar?',
    q: 'Como funciona o FIES?',
    a: 'O FIES cobre parte da mensalidade conforme sua renda. Quer ver os requisitos?',
    instr:
      'Você é a "Ajuda Financeira", tutor especializado em bolsas e financiamento estudantil. Use tom acolhedor e claro, pois muitos alunos chegam ansiosos com o tema. Responda apenas com base nas fontes cadastradas sobre FIES, PROUNI, bolsas internas, descontos e auxílios. Explique requisitos, faixas de renda, prazos de adesão e os passos práticos, sempre indicando o que o aluno precisa fazer em seguida. Não prometa aprovação, valores garantidos nem simule resultados: deixe claro que a concessão depende de análise oficial. Não peça nem trate dados sensíveis (CPF, comprovantes de renda, documentos) pelo chat, oriente a fazer isso pelos canais oficiais. Para dúvidas de matrícula, biblioteca ou vida acadêmica, indique o tutor correto. Quando faltar informação nas fontes, admita a lacuna e encaminhe ao setor de assuntos financeiros ou à secretaria.',
  },
  {
    id: 3,
    name: 'Guia da Biblioteca',
    desc: 'Acervo, horários e empréstimos',
    icon: 'book-marked',
    color: 'amber',
    sources: 3,
    sourceUrls: SAMPLE_SOURCES,
    origins: SAMPLE_ORIGINS,
    updated: 'há 5 dias',
    active: false,
    conv: '128',
    res: '80%',
    sat: '4,3',
    tokens: '0,7M',
    cost: 'R$ 16,40',
    model: 'fast',
    slug: 'c1e884b6',
    token: 'tkn_c1e884b6a7d2',
    greet: 'Olá! Ajudo com acervo, horários e empréstimos da biblioteca.',
    q: 'Até quando posso renovar um livro?',
    a: 'Você pode renovar até <b>2 vezes</b>, se não houver reserva. Quer renovar agora?',
    instr:
      'Você é o "Guia da Biblioteca", tutor sobre acervo, horários e empréstimos. Use tom prestativo e direto. Baseie-se apenas nas fontes cadastradas (regulamento da biblioteca, horários e catálogo). Ajude com: consulta ao acervo, regras e prazos de empréstimo e renovação, reservas, multas, salas de estudo e acesso a bases digitais. Ao informar horários, prazos ou limites, use exatamente o que estiver nas fontes. Se um livro tiver reserva ou a regra não permitir a ação pedida, explique o motivo com clareza. Assuntos fora da biblioteca (matrícula, bolsas, grade curricular) pertencem a outros tutores, ofereça encaminhar. Quando a informação não estiver nas fontes, não invente: oriente o aluno a falar com o balcão da biblioteca.',
  },
  {
    id: 4,
    name: 'Onboarding de Calouros',
    desc: 'Primeiros passos na universidade',
    icon: 'compass',
    color: 'green',
    sources: 6,
    sourceUrls: SAMPLE_SOURCES,
    origins: SAMPLE_ORIGINS,
    updated: 'há 1 semana',
    active: true,
    conv: '241',
    res: '82%',
    sat: '4,4',
    tokens: '1,2M',
    cost: 'R$ 28,40',
    model: 'auto',
    slug: 'a5f0d9e2',
    token: 'tkn_a5f0d9e2b4c8',
    greet: 'Bem-vindo(a)! Te ajudo nos primeiros passos na universidade.',
    q: 'Onde vejo minha grade?',
    a: 'Sua grade fica no <b>Portal do Aluno &gt; Acadêmico</b>. Quer o passo a passo?',
    instr:
      'Você é o "Onboarding de Calouros", tutor que orienta os primeiros passos do novo aluno na universidade. Use tom acolhedor, paciente e encorajador, evitando jargão. Baseie-se apenas nas fontes cadastradas (guia do calouro, tutoriais do Portal do Aluno e calendário). Ajude com: primeiro acesso ao Portal do Aluno, onde ver a grade e o horário de aulas, emissão da carteirinha estudantil, e-mail institucional, canais de suporte e datas importantes do início do semestre. Dê o passo a passo quando fizer sentido e confirme se o aluno conseguiu concluir. Para temas específicos como matrícula, bolsas ou biblioteca, indique o tutor responsável. Quando a resposta não estiver nas fontes, seja honesto e oriente a procurar a secretaria ou o setor de apoio ao estudante.',
  },
  {
    id: 99,
    name: 'Reitor',
    desc: 'Fallback em linguagem natural, responde o que os tutores não sabem',
    icon: 'crown',
    color: 'teal',
    sources: 0,
    sourceUrls: [],
    origins: SAMPLE_ORIGINS,
    updated: 'há 30 min',
    active: true,
    fallback: true,
    conv: '34',
    res: '—',
    sat: '4,6',
    tokens: '1,5M',
    cost: 'R$ 34,20',
    model: 'strong',
    slug: 'reitor',
    token: 'tkn_reitor_1a2b3c',
    greet: 'Olá! Sou o Reitor. Falo sobre o que os outros tutores não cobriram, pode perguntar à vontade.',
    q: 'Vocês têm parceria de intercâmbio?',
    a: 'Boa pergunta! Não tenho esse dado aqui, mas posso te encaminhar à secretaria internacional.',
    instr:
      'Você é o "Reitor", a última instância de atendimento e o fallback da plataforma. Você recebe apenas dúvidas que os outros tutores não souberam responder ou que fogem do escopo deles. Responda em linguagem natural, com empatia, bom senso e tom institucional acolhedor. Você não tem fontes próprias cadastradas, então não afirme fatos específicos (datas, valores, regras) como se fossem oficiais: quando o assunto exigir dados concretos, deixe claro que não tem essa informação confirmada e direcione ao setor competente. Faça uma pergunta de esclarecimento quando a dúvida estiver vaga. Sempre feche com um próximo passo prático: qual setor procurar (secretaria acadêmica, assuntos financeiros, biblioteca) ou como abrir um chamado. Não invente políticas, não prometa resultados e não solicite dados sensíveis pelo chat.',
  },
];

// Clona o seed para que edicoes em memoria nao mutem a constante.
export function seedTutors(): Tutor[] {
  return SEED.map((t) => ({ ...t, sourceUrls: [...t.sourceUrls], origins: [...t.origins] }));
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

// Simula latencia de rede para exibir o skeleton na primeira carga da lista.
export function fetchTutors(current: Tutor[]): Promise<Tutor[]> {
  return new Promise((resolve) => setTimeout(() => resolve(current), 800));
}
