// Rota /embed?token=<embed_token>: alvo do iframe, renderiza SO o chat.
// Nenhum segredo aqui; o embed token e publico e escopado ao tutor.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getWidgetConfig, type WidgetConfig } from '@/lib/api';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Spinner } from '@/components/ui';

const FALLBACK: WidgetConfig = { title: 'Assistente', greeting: 'Como posso ajudar voce hoje?' };

export function Widget() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Config e best-effort: se o backend nao responder, usa o fallback.
    getWidgetConfig(token)
      .then(setConfig)
      .catch(() => setConfig(FALLBACK))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="widget-shell widget-shell--centered">
        <p>Token de embed ausente.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="widget-shell widget-shell--centered">
        <Spinner label="Carregando tutor" />
      </div>
    );
  }

  const cfg = config ?? FALLBACK;
  return (
    <div className="widget-shell">
      {/* resume: carrega a conversa-modelo semeada e deixa o visitante continuar. */}
      <ChatWindow embedToken={token} title={cfg.title} greeting={cfg.greeting} resume />
    </div>
  );
}
