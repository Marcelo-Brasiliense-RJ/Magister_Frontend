// Sessao de chat do widget: mensagens, streaming e estados de erro/limite.
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, type ChatErrorCode } from '@/lib/sse';
import { startResumeSession } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

export type ChatStatus = 'idle' | 'streaming' | 'error' | 'rate_limited' | 'limit_reached' | 'offline';

interface ChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  errorMessage: string | null;
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

export function useChat(embedToken: string, opts?: { resume?: boolean }) {
  const [state, setState] = useState<ChatState>({ messages: [], status: 'idle', errorMessage: null });
  const sessionRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<string>('');

  // Resume da conversa-modelo: o servidor minta um session_id por visitante e clona o
  // template. Reusamos o id RETORNADO (nunca construimos um). So no widget (opts.resume).
  const resume = opts?.resume;
  useEffect(() => {
    if (!resume || !embedToken) return;
    let cancelled = false;
    startResumeSession(embedToken)
      .then((data) => {
        if (cancelled || !data.session_id || data.messages.length === 0) return;
        sessionRef.current = data.session_id;
        setState((s) => ({
          ...s,
          messages: data.messages.map((m) => ({ id: nextId(), role: m.role, content: m.content })),
        }));
      })
      .catch(() => {
        // Sem template ou backend fora: widget comeca vazio; o backend minta a sessao no
        // primeiro chat (nao forcamos id).
      });
    return () => {
      cancelled = true;
    };
  }, [embedToken, resume]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.status === 'streaming') return;
      lastMessageRef.current = trimmed;

      const userMsg: ChatMessage = { id: nextId(), role: 'user', content: trimmed };
      const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', content: '' };
      setState((s) => ({
        messages: [...s.messages, userMsg, assistantMsg],
        status: 'streaming',
        errorMessage: null,
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      const errorStatus: Record<ChatErrorCode, ChatStatus> = {
        rate_limited: 'rate_limited',
        limit_reached: 'limit_reached',
        inactive: 'error',
        server: 'error',
        network: 'offline',
      };

      await streamChat({
        embedToken,
        message: trimmed,
        sessionId: sessionRef.current,
        signal: controller.signal,
        onEvent: (event) => {
          switch (event.type) {
            case 'session':
              sessionRef.current = event.session_id;
              break;
            case 'token':
              // Concatena o token na ultima bolha do assistente (renderizada como texto).
              setState((s) => {
                const messages = s.messages.slice();
                const last = messages[messages.length - 1];
                if (last && last.role === 'assistant') {
                  messages[messages.length - 1] = { ...last, content: last.content + event.content };
                }
                return { ...s, messages };
              });
              break;
            case 'done':
              setState((s) => ({ ...s, status: 'idle' }));
              break;
            case 'error':
              // Remove a bolha vazia do assistente e sinaliza o estado de erro.
              setState((s) => {
                const messages = s.messages.slice();
                const last = messages[messages.length - 1];
                if (last && last.role === 'assistant' && last.content === '') messages.pop();
                return { messages, status: errorStatus[event.code], errorMessage: event.message };
              });
              break;
          }
        },
      });
    },
    [embedToken, state.status]
  );

  // Reenvia a ultima mensagem apos um erro ("tentar de novo").
  const retry = useCallback(() => {
    if (lastMessageRef.current) void send(lastMessageRef.current);
  }, [send]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => ({ ...s, status: 'idle' }));
  }, []);

  return { ...state, send, retry, stop };
}
