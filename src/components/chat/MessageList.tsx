import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/types';

interface MessageListProps {
  messages: ChatMessage[];
  streaming: boolean;
  greeting: string;
}

export function MessageList({ messages, streaming, greeting }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a ultima mensagem a cada atualizacao.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat__list">
        <div className="chat__empty">
          <p className="chat__empty-title">Ola!</p>
          {/* Conteudo do tutor renderizado como texto (React escapa). */}
          <p>{greeting}</p>
        </div>
      </div>
    );
  }

  const lastIndex = messages.length - 1;
  return (
    <div className="chat__list">
      {messages.map((m, i) => {
        const isStreamingBubble = streaming && i === lastIndex && m.role === 'assistant';
        return (
          <div key={m.id} className={`bubble bubble--${m.role}`}>
            {/* Mensagens/resposta do LLM sempre como texto. */}
            {m.content}
            {isStreamingBubble && <span className="caret" aria-hidden="true" />}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
