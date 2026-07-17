import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from './Icon';
import { useMagister } from './store';
import { HIST, MODELS, type ModelId, type Tutor } from './data';
import { useChat } from '@/hooks/useChat';

type Tab = 'config' | 'sources' | 'llm' | 'hist' | 'embed';
const TABS: { id: Tab; label: string }[] = [
  { id: 'config', label: 'Configuração' },
  { id: 'sources', label: 'Fontes & origens' },
  { id: 'llm', label: 'Modelo de IA' },
  { id: 'hist', label: 'Histórico' },
  { id: 'embed', label: 'Embed' },
];

function defaultInstr(name: string) {
  return `Você é o assistente "${name}". Responda de forma cordial e objetiva, usando apenas as fontes cadastradas. Se não souber, oriente a procurar a secretaria.`;
}

// Detalhe/edicao de tutor (inclui o Reitor, id 99). Abas + validacao + preview.
export function TutorDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTutor, saveTutor, toast } = useMagister();

  const editingId = id ? Number(id) : null;
  const tutor = editingId ? getTutor(editingId) : undefined;

  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'config');
  const [title, setTitle] = useState(tutor ? tutor.name : '');
  const [desc, setDesc] = useState(tutor ? tutor.desc : '');
  const [instr, setInstr] = useState(tutor ? tutor.instr || defaultInstr(tutor.name) : '');
  const [active, setActive] = useState(tutor ? tutor.active : true);
  const [model, setModel] = useState<ModelId>(tutor ? tutor.model : 'auto');
  const [sourceUrls, setSourceUrls] = useState<string[]>(tutor ? [...tutor.sourceUrls] : []);
  const [origins, setOrigins] = useState<string[]>(tutor ? [...tutor.origins] : []);
  const [titleError, setTitleError] = useState(false);
  const [rec, setRec] = useState<React.ReactNode>(null);
  const [suggested, setSuggested] = useState<ModelId | null>(null);
  const [bulk, setBulk] = useState<'url' | 'origin' | null>(null);
  const [copied, setCopied] = useState(false);

  const instrRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow do textarea de instrucoes.
  useEffect(() => {
    const ta = instrRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(120, ta.scrollHeight) + 'px';
  }, [instr, tab]);

  const detailTitle = tutor ? tutor.name : 'Novo tutor';
  const detailSub = tutor ? tutor.desc : 'Defina como o tutor conversa e de onde ele tira respostas.';

  const doSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      setTab('config');
      toast('err', 'Revise o formulário', 'Preencha os campos obrigatórios.');
      return;
    }
    setTitleError(false);
    saveTutor({
      id: editingId ?? undefined,
      name: title.trim(),
      desc: desc.trim(),
      active,
      sourceUrls: sourceUrls.map((u) => u.trim()).filter(Boolean),
      origins: origins.map((u) => u.trim()).filter(Boolean),
      instr,
      model,
    });
    toast('ok', 'Tutor salvo', 'As alterações já valem no widget embutido.');
    navigate('/admin');
  };

  const suggestModel = () => {
    let pick: ModelId;
    let why: string;
    if (editingId === 99) {
      pick = 'strong';
      why = 'o Reitor lida com conversas abertas e cheias de nuance, então o modelo mais capaz (Llama 3.3 70B) responde melhor.';
    } else if (instr.length > 500 || sourceUrls.length > 6) {
      pick = 'strong';
      why = 'este tutor tem instruções detalhadas e várias fontes, o modelo mais capaz (Llama 3.3 70B) aproveita melhor esse contexto.';
    } else {
      pick = 'fast';
      why = 'o escopo é objetivo e direto, o modelo rápido e econômico (Llama 3.1 8B) dá conta com folga e menor custo.';
    }
    setModel(pick);
    setSuggested(pick);
    const m = MODELS.find((x) => x.id === pick)!;
    setRec(
      <>
        <b>
          Sugestão: {m.name}
          {m.sub ? ` (${m.sub})` : ''}.
        </b>{' '}
        {why}
      </>,
    );
    toast('info', 'Sugestão pronta', `${m.name} combina com este tutor.`);
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>{detailTitle}</h1>
          <p>{detailSub}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={doSave}>
            <Icon name="check" /> Salvar
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Configuração */}
      {tab === 'config' && (
        <div className="tabpane active">
          <div className="card-block">
            <h3>Identidade</h3>
            <p className="desc">O que o visitante vê no topo do widget.</p>
            <div className="form-grid">
              <div className={`field${titleError ? ' invalid' : ''}`}>
                <label htmlFor="tTitle">Título do tutor</label>
                <input
                  className="ctl"
                  id="tTitle"
                  placeholder="Ex.: Suporte de Matrículas"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError(false);
                  }}
                />
                <span className="err">
                  <Icon name="circle-alert" /> O título é obrigatório.
                </span>
              </div>
              <div className="field">
                <label htmlFor="tDesc">Descrição curta</label>
                <input className="ctl" id="tDesc" placeholder="Uma linha que resume o tutor" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <span className="hint">Exibida abaixo do título no widget.</span>
              </div>
            </div>
          </div>
          <div className="card-block">
            <h3>Comportamento</h3>
            <p className="desc">Instruções que o modelo segue em toda resposta.</p>
            <div className="field">
              <label htmlFor="tInstr">Instruções do sistema</label>
              <textarea
                ref={instrRef}
                className="ctl"
                id="tInstr"
                maxLength={2000}
                placeholder="Você é um tutor cordial que responde apenas sobre…"
                value={instr}
                onChange={(e) => setInstr(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="hint">Seja específico sobre escopo e tom.</span>
                <span className="hint">{instr.length} / 2000</span>
              </div>
            </div>
          </div>
          <div className="card-block">
            <div className="status-row">
              <div className="txt">
                <b>Status do tutor</b>
                <small>{active ? 'Ativo, respondendo no widget' : 'Inativo, widget exibe aviso'}</small>
              </div>
              <button
                className={`switch${active ? ' on' : ''}`}
                role="switch"
                aria-checked={active}
                onClick={() => setActive((a) => !a)}
              >
                <span className="knob" />
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={doSave}>
              <Icon name="check" /> Salvar tutor
            </button>
          </div>
        </div>
      )}

      {/* Fontes & origens */}
      {tab === 'sources' && (
        <div className="tabpane active">
          <div className="card-block">
            <h3>Fontes de conhecimento</h3>
            <p className="desc">URLs que o tutor pode ler para responder. Adicione ou remova conforme necessário.</p>
            <UrlList kind="url" list={sourceUrls} onChange={setSourceUrls} />
            <AddRow
              placeholder="https://exemplo.com/faq"
              onAdd={(v) => setSourceUrls((l) => [...l, v])}
              onBulk={() => setBulk('url')}
            />
          </div>
          <div className="card-block">
            <h3>Origens permitidas</h3>
            <p className="desc">Domínios autorizados a embutir este tutor (CORS do iframe).</p>
            <UrlList kind="origin" list={origins} onChange={setOrigins} />
            <AddRow
              placeholder="https://meusite.com.br"
              onAdd={(v) => setOrigins((l) => [...l, v])}
              onBulk={() => setBulk('origin')}
            />
          </div>
        </div>
      )}

      {/* Modelo de IA */}
      {tab === 'llm' && (
        <div className="tabpane active">
          <div className="card-block">
            <h3>Modelo de IA</h3>
            <p className="desc">Escolha o cérebro do tutor. Não precisa ser técnico, cada opção explica o que faz e para quem serve.</p>
            <div className="suggest-box">
              <div className="sb-txt">
                <b>Não sabe qual escolher?</b>
                <small>Sugerimos o melhor modelo a partir das instruções e fontes deste tutor.</small>
              </div>
              <button className="btn btn-primary" onClick={suggestModel}>
                <Icon name="sparkles" /> Sugerir modelo
              </button>
            </div>
            {rec && (
              <div className="rec-callout show">
                <Icon name="wand-2" />
                <div>{rec}</div>
              </div>
            )}
            <div className="llm-list">
              {MODELS.map((m) => (
                <div key={m.id} className={`llm-card${m.id === model ? ' sel' : ''}`} onClick={() => setModel(m.id)}>
                  <div className="llm-radio" />
                  <div className="llm-main">
                    <div className="llm-top">
                      <span className="llm-name">{m.name}</span>
                      {m.sub && <span className="llm-badge tag">{m.sub}</span>}
                      {m.tag && <span className="llm-badge rec">{m.tag}</span>}
                      {suggested === m.id && <span className="llm-badge rec">Sugerido</span>}
                    </div>
                    <div className="llm-desc">{m.desc}</div>
                    <div className="llm-meters">
                      <div className="meter">
                        <span className="ml">Velocidade</span>
                        <Dots n={m.speed} />
                      </div>
                      <div className="meter">
                        <span className="ml">Economia</span>
                        <Dots n={m.econ} />
                      </div>
                      <div className="meter">
                        <span className="ml">Capacidade</span>
                        <Dots n={m.cap} />
                      </div>
                    </div>
                    <div className="llm-ideal">
                      <b>Ideal para:</b> {m.ideal}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="hint" style={{ marginTop: 14 }}>
              Você pode trocar o modelo quando quiser, a mudança vale na próxima resposta do widget.
            </p>
          </div>
        </div>
      )}

      {/* Histórico */}
      {tab === 'hist' && (
        <div className="tabpane active">
          <div className="card-block">
            <h3>Histórico de conversas</h3>
            <HistoryPane tutor={tutor} />
          </div>
        </div>
      )}

      {/* Embed */}
      {tab === 'embed' && (
        <div className="tabpane active">
          <EmbedPane tutor={tutor} title={title} copied={copied} setCopied={setCopied} />
        </div>
      )}

      {bulk && (
        <BulkModal
          kind={bulk}
          initial={bulk === 'url' ? sourceUrls : origins}
          onClose={() => setBulk(null)}
          onApply={(items) => {
            if (bulk === 'url') setSourceUrls(items);
            else setOrigins(items);
            toast('ok', bulk === 'url' ? 'Fontes atualizadas' : 'Origens atualizadas', `${items.length} ${items.length === 1 ? 'item' : 'itens'} na lista.`);
            setBulk(null);
          }}
        />
      )}
    </section>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <div className="dots">
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} />
      ))}
    </div>
  );
}

function UrlList({ kind, list, onChange }: { kind: 'url' | 'origin'; list: string[]; onChange: (l: string[]) => void }) {
  return (
    <div>
      {list.map((u, i) => (
        <div className="url-row" key={i}>
          <span className="src-ic">
            <Icon name={kind === 'url' ? 'link' : 'globe'} />
          </span>
          <input className="ctl" value={u} onChange={(e) => onChange(list.map((x, idx) => (idx === i ? e.target.value : x)))} />
          <button className="icon-btn" onClick={() => onChange(list.filter((_, idx) => idx !== i))} aria-label="Remover">
            <Icon name="trash-2" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddRow({ placeholder, onAdd, onBulk }: { placeholder: string; onAdd: (v: string) => void; onBulk: () => void }) {
  const [value, setValue] = useState('');
  const add = () => {
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue('');
  };
  return (
    <div className="add-url">
      <input
        className="ctl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
      />
      <button className="btn btn-secondary" onClick={add}>
        <Icon name="plus" /> Adicionar
      </button>
      <button className="btn btn-ghost" onClick={onBulk}>
        <Icon name="list-plus" /> Em lote
      </button>
    </div>
  );
}

// Aba Histórico: reproduz fillHistory (Reitor mostra escaladas; tutor comum, banco de perguntas).
function HistoryPane({ tutor }: { tutor?: Tutor }) {
  const items = useMemo(() => {
    if (!tutor) return { head: 'Sem conversas ainda', rows: [] as { q: string; meta: React.ReactNode }[] };
    if (tutor.fallback) {
      return {
        head: '34 conversas escaladas ao Reitor · últimos 7 dias',
        rows: HIST.map((h) => ({
          q: h.q,
          meta: (
            <>
              de <b style={{ color: 'var(--color-text)' }}>{h.from}</b> <span className={`hist-out ${h.out}`}>{h.outLabel}</span> · {h.time}
            </>
          ),
        })),
      };
    }
    const qbank = [
      tutor.q,
      'Como funciona o processo?',
      'Qual o prazo?',
      'Onde encontro mais informações?',
      'Preciso levar algum documento?',
      'Consigo resolver isso online?',
      'Posso fazer pelo celular?',
      'Qual o horário de atendimento?',
      'Preciso pagar alguma taxa?',
      'Como falo com um atendente?',
      'Onde baixo o comprovante?',
      'Isso vale para todos os cursos?',
      'Tem prazo para recorrer?',
      'Consigo remarcar?',
      'Qual documento preciso enviar?',
      'Recebo confirmação por e-mail?',
    ];
    const times = ['há 5 min', 'há 22 min', 'há 1 h', 'há 2 h', 'há 3 h', 'há 5 h', 'hoje, 09:12', 'hoje, 08:40', 'ontem, 17:30', 'ontem, 15:02', 'ontem, 11:20', 'há 2 dias', 'há 2 dias', 'há 3 dias', 'há 4 dias', 'há 6 dias'];
    const total = tutor.conv === '—' ? '0' : tutor.conv;
    return {
      head: `Mostrando as ${qbank.length} mais recentes de ${total} conversas · últimos 7 dias`,
      rows: qbank.map((q, i) => ({
        q,
        meta: (
          <>
            <span className={`hist-out ${i % 7 === 3 ? 'fwd' : 'ok'}`}>{i % 7 === 3 ? 'Encaminhada' : 'Resolvida'}</span> · {times[i]}
          </>
        ),
      })),
    };
  }, [tutor]);

  return (
    <>
      <p className="desc">{items.head}</p>
      <div className="hist-list" style={{ maxHeight: 'none' }}>
        {items.rows.map((it, i) => (
          <div className="hist-item" key={i}>
            <span className="hist-ic">
              <Icon name="message-circle-question" />
            </span>
            <div className="hist-body">
              <div className="hist-q">{it.q}</div>
              <div className="hist-meta">{it.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Aba Embed: instrucoes + token + snippet destacado + preview do widget ao vivo.
function EmbedPane({
  tutor,
  title,
  copied,
  setCopied,
}: {
  tutor?: Tutor;
  title: string;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  const { toast } = useMagister();
  const name = title.trim() || (tutor ? tutor.name : 'Novo tutor');
  const slug = tutor?.slug || 'novo-tutor';
  const token = tutor?.token || 'tkn_novo';
  const icon = tutor?.icon || 'bot';
  const greet = tutor?.greet || `Olá! Sou o ${name}. Como posso ajudar?`;

  const plainSnippet = `<!-- Magister · ${name} -->
<iframe src="https://embed.magister.ai/t/${slug}"
        width="400" height="560" loading="lazy"
        title="${name}"
        style="border:0;border-radius:16px"></iframe>`;

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(plainSnippet);
    } catch {
      /* clipboard indisponível: segue só com o toast */
    }
    setCopied(true);
    toast('info', 'Snippet copiado', 'Cole no HTML do seu site.');
    setTimeout(() => setCopied(false), 1800);
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      /* noop */
    }
    toast('info', 'Token copiado', token);
  };

  return (
    <div className="embed-grid">
      <div>
        <div className="card-block">
          <h3>Como usar</h3>
          <ol className="doc-list">
            <li>
              <span className="num">1</span> Copie o snippet abaixo.
            </li>
            <li>
              <span className="num">2</span> Cole no HTML do seu site onde o chat deve aparecer.
            </li>
            <li>
              <span className="num">3</span> Garanta que o domínio esteja em <b>Origens permitidas</b>.
            </li>
            <li>
              <span className="num">4</span> Publique, o widget carrega e já responde.
            </li>
          </ol>
        </div>
        <div className="card-block">
          <h3>Token de embed</h3>
          <p className="desc">Identifica este tutor. Mantenha em segredo relativo, as origens permitidas protegem o uso.</p>
          <div className="token-box">
            <code>{token}</code>
            <button className="icon-btn" onClick={copyToken} aria-label="Copiar token">
              <Icon name="copy" />
            </button>
          </div>
        </div>
        <div className="card-block">
          <h3>Snippet &lt;iframe&gt;</h3>
          <p className="desc">
            Cole antes de <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>&lt;/body&gt;</code> no site.
          </p>
          <div className="codewrap">
            <div className="codebar">
              <span className="lbl">HTML</span>
              <button className={`copybtn${copied ? ' done' : ''}`} onClick={copySnippet}>
                <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="code">
              <span className="cm">{`<!-- Magister · ${name} -->`}</span>
              {'\n'}
              <span className="tg">{'<iframe'}</span> <span className="at">src</span>=<span className="st">{`"https://embed.magister.ai/t/${slug}"`}</span>
              {'\n        '}
              <span className="at">width</span>=<span className="st">"400"</span> <span className="at">height</span>=<span className="st">"560"</span> <span className="at">loading</span>=<span className="st">"lazy"</span>
              {'\n        '}
              <span className="at">title</span>=<span className="st">{`"${name}"`}</span>
              {'\n        '}
              <span className="at">style</span>=<span className="st">"border:0;border-radius:16px"</span>
              <span className="tg">{'></iframe>'}</span>
            </pre>
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>
          Preview ao vivo
        </div>
        {/* key={token}: troca de tutor remonta e reinicia a sessao de chat. */}
        <LivePreview key={token} token={token} name={name} icon={icon} greet={greet} />
      </div>
    </div>
  );
}

// Preview funcional: conversa com o backend real via useChat + embed token do tutor.
// Mantem o visual do mini-widget; so o comportamento passou a ser real (SSE).
function LivePreview({ token, name, icon, greet }: { token: string; name: string; icon: string; greet: string }) {
  const { messages, status, send, retry } = useChat(token);
  const [text, setText] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const streaming = status === 'streaming';

  // Rola pro fim a cada token/mensagem novos.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || streaming || status === 'limit_reached') return;
    void send(trimmed);
    setText('');
  };

  return (
    <div className="preview-frame">
      <div className="mini-widget">
        <div className="mw-head">
          <span className="ic">
            <Icon name={icon} />
          </span>
          <div>
            <b>{name}</b>
            <small>
              <span className="d" /> Online
            </small>
          </div>
        </div>
        <div className="mw-body" ref={bodyRef}>
          <div className="bubble bot" dangerouslySetInnerHTML={{ __html: greet }} />
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role === 'user' ? 'me' : 'bot'}`}>
              {/* Resposta do backend renderizada como texto (nunca HTML). */}
              {m.content || (m.role === 'assistant' && streaming ? '…' : '')}
            </div>
          ))}
          {(status === 'error' || status === 'offline') && (
            <div className="mw-error">
              Falha ao responder.{' '}
              <button type="button" onClick={retry}>
                Tentar de novo
              </button>
            </div>
          )}
          {status === 'rate_limited' && <div className="mw-error">Muitas mensagens. Aguarde um instante.</div>}
          {status === 'limit_reached' && <div className="mw-error">Limite desta sessão atingido.</div>}
        </div>
        <div className="mw-composer">
          <input
            className="mw-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Escreva sua mensagem…"
            disabled={status === 'limit_reached'}
          />
          <button
            type="button"
            className="mw-send"
            onClick={submit}
            disabled={streaming || status === 'limit_reached'}
            aria-label="Enviar"
          >
            <Icon name="arrow-up" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de edicao em lote (uma URL/origem por linha), com dedupe.
function BulkModal({
  kind,
  initial,
  onClose,
  onApply,
}: {
  kind: 'url' | 'origin';
  initial: string[];
  onClose: () => void;
  onApply: (items: string[]) => void;
}) {
  const [text, setText] = useState(initial.join('\n'));
  const count = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ width: 480 }} role="dialog" aria-modal="true">
        <div className="mh" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>{kind === 'url' ? 'Fontes em lote' : 'Origens em lote'}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>Cole um item por linha.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {count} {count === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <textarea
          className="ctl"
          style={{ minHeight: 210, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65, resize: 'vertical' }}
          placeholder={'https://exemplo.com/pagina-1\nhttps://exemplo.com/pagina-2\nhttps://exemplo.com/pagina-3'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="mf" style={{ marginTop: 18 }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onApply([
                ...new Set(
                  text
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                ),
              ])
            }
          >
            <Icon name="check" /> Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
