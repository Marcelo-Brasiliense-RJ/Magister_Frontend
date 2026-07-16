import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '@/lib/api';
import { Button, Spinner, useToast } from '@/components/ui';
import './admin.css';

export function EmbedSnippet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [snippet, setSnippet] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getEmbedInfo(id)
      .then((info) => {
        setToken(info.embed_token);
        // Prefere o snippet do backend; senao monta com a origem atual do painel.
        setSnippet(info.snippet || buildSnippet(info.embed_token));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Falha ao carregar embed.'));
  }, [id]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.push('success', 'Snippet copiado.');
    } catch {
      toast.push('error', 'Nao foi possivel copiar.');
    }
  };

  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Incorporar tutor</h1>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          Voltar
        </Button>
      </div>

      {error && (
        <div className="login__error" role="alert">
          {error}
        </div>
      )}

      {!token && !error ? (
        <Spinner label="Carregando embed" />
      ) : token ? (
        <div className="embed-block">
          <p style={{ color: 'var(--text-muted)' }}>
            Cole este trecho no site que vai hospedar o tutor. O <strong>embed token</strong> e
            publico e escopado a este tutor, nao contem segredos.
          </p>

          <div className="field">
            <span className="field__label">Embed token</span>
            {/* Token renderizado como texto. */}
            <code className="code-block">{token}</code>
          </div>

          <div className="field">
            <span className="field__label">Snippet iframe</span>
            <div className="code-block">
              {snippet}
              <div className="code-block__copy">
                <Button size="sm" onClick={copy}>
                  Copiar
                </Button>
              </div>
            </div>
          </div>

          <div className="field">
            <span className="field__label">Preview ao vivo</span>
            <div className="embed-preview">
              <iframe
                title="Preview do widget"
                src={`${window.location.origin}/embed?token=${encodeURIComponent(token)}`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

// Monta o snippet iframe usando a origem do painel (fallback ao snippet do backend).
function buildSnippet(embedToken: string): string {
  const src = `${window.location.origin}/embed?token=${embedToken}`;
  return `<iframe
  src="${src}"
  width="400"
  height="560"
  style="border:0;border-radius:16px;max-width:100%"
  title="Magister"
></iframe>`;
}
