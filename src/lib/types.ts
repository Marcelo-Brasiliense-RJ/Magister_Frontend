// Tipos do dominio compartilhados. Espelham os schemas do backend.

export type TutorStatus = 'active' | 'inactive';

export interface Tutor {
  id: string;
  title: string;
  description: string;
  status: TutorStatus;
  system_instructions: string;
  sources: string[];
  allowed_origins: string[];
  embed_token: string;
  created_at: string;
  updated_at: string;
}

// Payload de criacao/edicao (sem campos derivados pelo servidor).
export interface TutorInput {
  title: string;
  description: string;
  system_instructions: string;
  sources: string[];
  allowed_origins: string[];
}

export interface EmbedInfo {
  embed_token: string;
  snippet: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}
