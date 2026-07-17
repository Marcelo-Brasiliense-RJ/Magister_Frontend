// Cliente REST do painel admin. Segredos nunca ficam aqui: so o JWT em memoria/localStorage.
import type { ChatRole, EmbedInfo, Tutor, TutorInput } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'magister_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Erro tipado para a UI distinguir 401 (sessao expirada) de falhas genericas.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Nao foi possivel conectar ao servidor.');
  }

  if (!res.ok) {
    // Mensagem amigavel; detalhe tecnico fica no backend (sem stack trace na UI).
    const detail = await res.json().catch(() => null);
    const message =
      (detail && (detail.detail || detail.message)) ||
      (res.status === 401 ? 'Sessao expirada. Faca login novamente.' : 'Falha na requisicao.');
    throw new ApiError(res.status, String(message));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<string> {
  const data = await request<{ access_token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return data.access_token;
}

export function listTutors(): Promise<Tutor[]> {
  return request<Tutor[]>('/api/tutors');
}

export function getTutor(id: number): Promise<Tutor> {
  return request<Tutor>(`/api/tutors/${id}`);
}

export function createTutor(input: TutorInput): Promise<Tutor> {
  return request<Tutor>('/api/tutors', { method: 'POST', body: JSON.stringify(input) });
}

export function updateTutor(id: number, input: TutorInput): Promise<Tutor> {
  return request<Tutor>(`/api/tutors/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function setTutorStatus(id: number, status: Tutor['status']): Promise<Tutor> {
  return request<Tutor>(`/api/tutors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getEmbedInfo(id: number): Promise<EmbedInfo> {
  return request<EmbedInfo>(`/api/tutors/${id}/embed`);
}

// Config publica do widget resolvida pelo embed token (nao exige JWT nem expoe segredo).
export interface WidgetConfig {
  title: string;
  greeting: string;
}

export async function getWidgetConfig(embedToken: string): Promise<WidgetConfig> {
  const res = await fetch(`${API_URL}/api/embed/${encodeURIComponent(embedToken)}`);
  if (!res.ok) throw new ApiError(res.status, 'Tutor indisponivel.');
  return res.json() as Promise<WidgetConfig>;
}

// Resume da conversa-modelo (publica): o servidor MINTA um session_id por visitante
// (clona o template a cada abertura). O cliente nunca constroi o id.
export interface ResumeSession {
  session_id: string | null;
  messages: { role: ChatRole; content: string }[];
}

export async function startResumeSession(embedToken: string): Promise<ResumeSession> {
  const res = await fetch(`${API_URL}/api/embed/${encodeURIComponent(embedToken)}/session`, {
    method: 'POST',
  });
  if (!res.ok) throw new ApiError(res.status, 'Sessao indisponivel.');
  return res.json() as Promise<ResumeSession>;
}

export { API_URL };
