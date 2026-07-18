// Consumo do stream SSE de POST /api/chat via fetch + ReadableStream.
// EventSource nativo so faz GET; o chat e POST, entao parseamos os frames a mao.
import { API_URL } from './api';

// Eventos que o backend emite no stream (contrato com a rota de chat).
export type ChatStreamEvent =
  | { type: 'session'; session_id: string }
  | { type: 'token'; content: string }
  | { type: 'done' }
  | { type: 'error'; code: ChatErrorCode; message: string };

export type ChatErrorCode = 'rate_limited' | 'limit_reached' | 'inactive' | 'server' | 'network';

export interface StreamChatParams {
  embedToken: string;
  message: string;
  sessionId?: string;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
}

export async function streamChat({
  embedToken,
  message,
  sessionId,
  signal,
  onEvent,
}: StreamChatParams): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ embed_token: embedToken, session_id: sessionId, message }),
      signal,
    });
  } catch {
    onEvent({ type: 'error', code: 'network', message: 'Sem conexao com o servidor.' });
    return;
  }

  if (!res.ok || !res.body) {
    onEvent(mapHttpError(res.status));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    // Le em blocos e separa frames SSE pela linha em branco. sse-starlette usa CRLF,
    // entao o limite pode vir como \r\n\r\n, \n\n ou \r\r (todos validos na spec).
    const boundary = /\r\n\r\n|\n\n|\r\r/;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let m: RegExpExecArray | null;
      while ((m = boundary.exec(buffer)) !== null) {
        const frame = buffer.slice(0, m.index);
        buffer = buffer.slice(m.index + m[0].length);
        const event = parseFrame(frame);
        if (event) onEvent(event);
      }
    }
  } catch {
    // Abort e esperado quando o usuario cancela; nao vira erro visivel.
    if (!signal?.aborted) {
      onEvent({ type: 'error', code: 'network', message: 'Conexao interrompida.' });
    }
  }
}

// Extrai o payload `data:` de um frame SSE e decodifica o JSON do evento.
function parseFrame(frame: string): ChatStreamEvent | null {
  const dataLines = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim());
  if (dataLines.length === 0) return null;

  const raw = dataLines.join('\n');
  try {
    return JSON.parse(raw) as ChatStreamEvent;
  } catch {
    // Fallback: trata payload nao-JSON como token de texto.
    return { type: 'token', content: raw };
  }
}

function mapHttpError(status: number): ChatStreamEvent {
  if (status === 429) return { type: 'error', code: 'rate_limited', message: 'Muitas mensagens. Aguarde um instante.' };
  if (status === 402 || status === 403)
    return { type: 'error', code: 'limit_reached', message: 'Limite de uso atingido nesta sessao.' };
  if (status === 404) return { type: 'error', code: 'inactive', message: 'Tutor indisponivel.' };
  return { type: 'error', code: 'server', message: 'Falha no servidor. Tente novamente.' };
}
