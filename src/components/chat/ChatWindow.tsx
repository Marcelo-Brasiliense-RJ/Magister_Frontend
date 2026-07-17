import { useChat } from '@/hooks/useChat';
import { Logo } from '@/components/ui';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import './chat.css';

interface ChatWindowProps {
  embedToken: string;
  title: string;
  greeting: string;
  resume?: boolean; // resume a conversa-modelo semeada (widget do iframe)
}

const DEFAULT_GREETING = 'Como posso ajudar voce hoje?';

export function ChatWindow({ embedToken, title, greeting, resume }: ChatWindowProps) {
  const { messages, status, errorMessage, send, retry } = useChat(embedToken, { resume });
  const streaming = status === 'streaming';

  return (
    <div className="chat">
      <header className="chat__header">
        <Logo height={20} />
        {/* Titulo do tutor como texto. */}
        <span className="chat__header-title" title={title}>
          {title}
        </span>
      </header>

      <MessageList
        messages={messages}
        streaming={streaming}
        greeting={greeting || DEFAULT_GREETING}
      />

      {(status === 'error' || status === 'offline') && (
        <div className="chat__status chat__status--error" role="alert">
          <span>{errorMessage ?? 'Algo deu errado.'}</span>
          <button className="btn btn--ghost btn--sm" onClick={retry} type="button">
            Tentar de novo
          </button>
        </div>
      )}
      {status === 'rate_limited' && (
        <div className="chat__status chat__status--limit" role="alert">
          <span>{errorMessage ?? 'Muitas mensagens. Aguarde um instante.'}</span>
        </div>
      )}
      {status === 'limit_reached' && (
        <div className="chat__status chat__status--limit" role="alert">
          <span>{errorMessage ?? 'Limite de uso desta sessao atingido.'}</span>
        </div>
      )}

      <Composer onSend={send} disabled={streaming || status === 'limit_reached'} />

      <footer className="chat__footer">
        powered by <strong>Magister</strong>
      </footer>
    </div>
  );
}
