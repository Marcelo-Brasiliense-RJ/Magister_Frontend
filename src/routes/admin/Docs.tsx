import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

// Ordem das secoes na prose (usada pelo scrollspy da nav lateral).
const DOC_SECS = [
  'doc-intro',
  'doc-concepts',
  'doc-create',
  'doc-sources',
  'doc-embed',
  'doc-auth',
  'doc-api',
  'doc-webhooks',
  'doc-reitor',
  'doc-security',
  'doc-faq',
];

export function Docs() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('doc-intro');

  // Scroll suave ate a secao dentro do container `.content` (o pai que rola).
  const docGo = (id: string) => {
    setActive(id);
    const content = rootRef.current?.closest('.content');
    const target = document.getElementById(id);
    if (content && target) {
      const cr = content.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      content.scrollTo({ top: content.scrollTop + (tr.top - cr.top) - 16, behavior: 'smooth' });
    }
  };

  // Scrollspy: destaca o item da nav conforme a secao visivel no `.content`.
  useEffect(() => {
    const content = rootRef.current?.closest('.content');
    if (!content) return;
    const spy = () => {
      const limit = content.getBoundingClientRect().top + Math.max(140, content.clientHeight * 0.38);
      let idx = 0;
      DOC_SECS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= limit) idx = i;
      });
      setActive(DOC_SECS[idx]);
    };
    content.addEventListener('scroll', spy);
    spy(); // estado inicial
    return () => content.removeEventListener('scroll', spy);
  }, []);

  return (
    <section className="page" id="view-docs" ref={rootRef}>
      <div className="page-head">
        <div>
          <h1>Documentação</h1>
          <p>Tudo o que você precisa para colocar um tutor no ar.</p>
        </div>
      </div>
      <div className="docs-layout">
        <nav className="docs-nav">
          <span className="dl">Começar</span>
          <a className={active === 'doc-intro' ? 'on' : undefined} onClick={() => docGo('doc-intro')}>
            <Icon name="rocket" /> Introdução
          </a>
          <a className={active === 'doc-concepts' ? 'on' : undefined} onClick={() => docGo('doc-concepts')}>
            <Icon name="shapes" /> Conceitos
          </a>
          <span className="dl">Integração</span>
          <a className={active === 'doc-create' ? 'on' : undefined} onClick={() => docGo('doc-create')}>
            <Icon name="wand-2" /> Criar um tutor
          </a>
          <a className={active === 'doc-sources' ? 'on' : undefined} onClick={() => docGo('doc-sources')}>
            <Icon name="link" /> Fontes & origens
          </a>
          <a className={active === 'doc-embed' ? 'on' : undefined} onClick={() => docGo('doc-embed')}>
            <Icon name="code-xml" /> Embed via iframe
          </a>
          <span className="dl">API</span>
          <a className={active === 'doc-auth' ? 'on' : undefined} onClick={() => docGo('doc-auth')}>
            <Icon name="key-round" /> Autenticação
          </a>
          <a className={active === 'doc-api' ? 'on' : undefined} onClick={() => docGo('doc-api')}>
            <Icon name="terminal" /> API REST
          </a>
          <a className={active === 'doc-webhooks' ? 'on' : undefined} onClick={() => docGo('doc-webhooks')}>
            <Icon name="webhook" /> Webhooks
          </a>
          <span className="dl">Avançado</span>
          <a className={active === 'doc-reitor' ? 'on' : undefined} onClick={() => docGo('doc-reitor')}>
            <Icon name="crown" /> Reitor (fallback)
          </a>
          <a className={active === 'doc-security' ? 'on' : undefined} onClick={() => docGo('doc-security')}>
            <Icon name="shield-check" /> Segurança
          </a>
          <a className={active === 'doc-faq' ? 'on' : undefined} onClick={() => docGo('doc-faq')}>
            <Icon name="circle-help" /> Dúvidas frequentes
          </a>
        </nav>
        <div className="prose">
          <h2 id="doc-intro">Introdução</h2>
          <p className="lead">
            O Magister transforma o conhecimento da sua instituição em tutores de IA que conversam em linguagem natural e
            vivem dentro do seu site, sem backend, sem build e sem time de dados.
          </p>
          <p>
            Cada tutor é um assistente focado num assunto (matrículas, financeiro, biblioteca…). Você descreve como ele
            deve se comportar, aponta as fontes que ele pode consultar e recebe um trecho de{' '}
            <code className="inline">{'<iframe>'}</code> para colar onde quiser. Em minutos o widget está no ar
            respondendo seus visitantes.
          </p>
          <div className="callout">
            <Icon name="lightbulb" />
            <div>
              <b>Comece pelo exemplo.</b> O tutor “Suporte de Matrículas” já vem com fontes e instruções, abra-o, mande
              uma pergunta no preview e veja o fluxo completo antes de criar o seu.
            </div>
          </div>

          <h2 id="doc-concepts">Conceitos</h2>
          <p>Três peças formam a plataforma:</p>
          <table className="ptable">
            <thead>
              <tr>
                <th>Peça</th>
                <th>O que é</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tutor</td>
                <td>Um assistente de IA com escopo, instruções e fontes próprias. Você cria quantos quiser.</td>
              </tr>
              <tr>
                <td>Widget</td>
                <td>A janela de chat responsiva que roda dentro do iframe no site do cliente.</td>
              </tr>
              <tr>
                <td>Reitor</td>
                <td>O agente de fallback: recebe o que os tutores não sabem e responde em linguagem natural.</td>
              </tr>
            </tbody>
          </table>
          <p>
            O visitante nunca escolhe “qual IA”, ele só conversa. Nos bastidores, o tutor certo responde e, quando não há
            resposta confiável, a conversa é escalada para o Reitor.
          </p>

          <h2 id="doc-create">Criar um tutor</h2>
          <p>
            Em <b>Tutores</b>, clique em <b>Novo tutor</b> e preencha a aba <b>Configuração</b>:
          </p>
          <ol className="doc-list">
            <li>
              <span className="num">1</span> <b>Título</b>, aparece no topo do widget (ex.: “Suporte de Matrículas”).
            </li>
            <li>
              <span className="num">2</span> <b>Descrição curta</b>, uma linha de contexto exibida abaixo do título.
            </li>
            <li>
              <span className="num">3</span> <b>Instruções do sistema</b>, o comportamento do tutor: tom, escopo e o que
              fazer quando não souber.
            </li>
          </ol>
          <p>
            Um bom bloco de instruções deixa claro <i>o que responder</i> e <i>o que recusar</i>. Por exemplo:
          </p>
          <div className="codewrap" style={{ marginTop: 6 }}>
            <div className="codebar">
              <span className="lbl">Instruções</span>
            </div>
            <pre className="code" style={{ whiteSpace: 'pre-wrap' }}>{`Você é o tutor de Matrículas 2026. Responda apenas sobre
prazos, documentos e o passo a passo da inscrição, sempre
em português e de forma objetiva. Se a pergunta fugir
desse tema, diga que não sabe e sugira falar com a
secretaria, nunca invente informação.`}</pre>
          </div>

          <h2 id="doc-sources">Fontes & origens</h2>
          <h3>Fontes de conhecimento</h3>
          <p>
            Na aba <b>Fontes & origens</b>, liste as URLs que o tutor pode ler para responder (FAQ, calendário, páginas
            oficiais). Adicione uma a uma ou use <b>Em lote</b> para colar várias de uma vez, uma por linha.
          </p>
          <div className="callout">
            <Icon name="lightbulb" />
            <div>Prefira páginas estáveis e específicas. Quanto mais focada a fonte, mais precisa a resposta.</div>
          </div>
          <h3>Origens permitidas</h3>
          <p>
            Defina os domínios autorizados a embutir o tutor. É o CORS do iframe: se o domínio não estiver na lista, o
            widget não carrega, protegendo seu token de uso indevido.
          </p>
          <div className="callout warn">
            <Icon name="shield-alert" />
            <div>
              Sem nenhuma origem cadastrada o tutor não roda em produção. Adicione ao menos o domínio principal do seu
              site.
            </div>
          </div>

          <h2 id="doc-embed">Embed via iframe</h2>
          <p>
            Na aba <b>Embed</b> você encontra o token e o snippet pronto. Copie e cole antes de{' '}
            <code className="inline">{'</body>'}</code> na página onde o chat deve aparecer:
          </p>
          <div className="codewrap" style={{ marginTop: 6 }}>
            <div className="codebar">
              <span className="lbl">HTML</span>
            </div>
            <pre className="code">
              <span className="tg">{'<iframe'}</span>
              {' '}
              <span className="at">{'src'}</span>
              {'='}
              <span className="st">{'"https://embed.magister.ai/t/9f2a7c41"'}</span>
              {'\n        '}
              <span className="at">{'width'}</span>
              {'='}
              <span className="st">{'"400"'}</span>
              {' '}
              <span className="at">{'height'}</span>
              {'='}
              <span className="st">{'"560"'}</span>
              {' '}
              <span className="at">{'loading'}</span>
              {'='}
              <span className="st">{'"lazy"'}</span>
              <span className="tg">{'></iframe>'}</span>
            </pre>
          </div>
          <p>Atributos aceitos:</p>
          <table className="ptable">
            <thead>
              <tr>
                <th>Atributo</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>src</td>
                <td>URL do tutor com o token de embed. Obrigatório.</td>
              </tr>
              <tr>
                <td>width / height</td>
                <td>Tamanho do widget. Recomendado entre 320–420px de largura.</td>
              </tr>
              <tr>
                <td>loading</td>
                <td>
                  <code className="inline">lazy</code> adia o carregamento até o iframe entrar na tela.
                </td>
              </tr>
              <tr>
                <td>title</td>
                <td>Rótulo acessível do iframe, lido por leitores de tela.</td>
              </tr>
            </tbody>
          </table>
          <div className="callout">
            <Icon name="smartphone" />
            <div>
              O widget é fluido de 320px a 420px+ e nunca gera overflow horizontal, seguro em qualquer layout, inclusive
              mobile.
            </div>
          </div>

          <h2 id="doc-auth">Autenticação</h2>
          <p>
            O <b>widget</b> (iframe) se autentica sozinho pelo token de embed, você não precisa fazer nada. Para chamadas{' '}
            <b>server-side</b> à API, use sua <b>chave de API</b> (em Configurações) no cabeçalho{' '}
            <code className="inline">Authorization</code>:
          </p>
          <div className="codewrap" style={{ marginTop: 6 }}>
            <div className="codebar">
              <span className="lbl">bash</span>
            </div>
            <pre className="code">
              <span className="cm">{'# Sempre no servidor, nunca exponha a chave no front-end'}</span>
              {'\n'}
              {'curl https://api.magister.ai/v1/tutors \\'}
              {'\n  -H '}
              <span className="st">{'"Authorization: Bearer sk_live_9f2a…c71"'}</span>
            </pre>
          </div>
          <div className="callout warn">
            <Icon name="shield-alert" />
            <div>
              A chave de API dá acesso total ao workspace. Guarde-a em variáveis de ambiente e rotacione se vazar.
            </div>
          </div>

          <h2 id="doc-api">API REST</h2>
          <p>
            Base: <code className="inline">https://api.magister.ai/v1</code>. Respostas em JSON. Principais endpoints:
          </p>
          <table className="ptable">
            <thead>
              <tr>
                <th>Método</th>
                <th>Endpoint · descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GET</td>
                <td>
                  <b>/tutors</b>, lista os tutores do workspace.
                </td>
              </tr>
              <tr>
                <td>POST</td>
                <td>
                  <b>/tutors</b>, cria um tutor (título, instruções, fontes).
                </td>
              </tr>
              <tr>
                <td>GET</td>
                <td>
                  <b>/tutors/:id</b>, detalhes e configuração de um tutor.
                </td>
              </tr>
              <tr>
                <td>POST</td>
                <td>
                  <b>/tutors/:id/messages</b>, envia uma mensagem e recebe a resposta.
                </td>
              </tr>
              <tr>
                <td>GET</td>
                <td>
                  <b>/tutors/:id/usage</b>, tokens, requisições e custo do período.
                </td>
              </tr>
            </tbody>
          </table>
          <div className="codewrap" style={{ marginTop: 6 }}>
            <div className="codebar">
              <span className="lbl">bash</span>
            </div>
            <pre className="code">
              {'curl https://api.magister.ai/v1/tutors/9f2a7c41/messages \\'}
              {'\n  -H '}
              <span className="st">{'"Authorization: Bearer sk_live_…"'}</span>
              {' \\'}
              {'\n  -d '}
              <span className="st">{'\'{ "message": "Qual o prazo de inscrição?" }\''}</span>
            </pre>
          </div>

          <h2 id="doc-webhooks">Webhooks</h2>
          <p>
            Receba eventos em tempo real no seu servidor. Configure a URL de destino em Configurações. Eventos
            disponíveis:
          </p>
          <table className="ptable">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Quando dispara</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>conversation.started</td>
                <td>Um visitante abre uma conversa no widget.</td>
              </tr>
              <tr>
                <td>message.created</td>
                <td>Nova mensagem do usuário ou do tutor.</td>
              </tr>
              <tr>
                <td>conversation.escalated</td>
                <td>A dúvida foi escalada para o Reitor.</td>
              </tr>
              <tr>
                <td>conversation.resolved</td>
                <td>A conversa foi encerrada como resolvida.</td>
              </tr>
            </tbody>
          </table>
          <div className="codewrap" style={{ marginTop: 6 }}>
            <div className="codebar">
              <span className="lbl">JSON · payload</span>
            </div>
            <pre className="code">
              {'{'}
              {'\n  '}
              <span className="at">{'"event"'}</span>
              {': '}
              <span className="st">{'"conversation.escalated"'}</span>
              {',\n  '}
              <span className="at">{'"tutor"'}</span>
              {': '}
              <span className="st">{'"Suporte de Matrículas"'}</span>
              {',\n  '}
              <span className="at">{'"reason"'}</span>
              {': '}
              <span className="st">{'"fora do escopo"'}</span>
              {',\n  '}
              <span className="at">{'"at"'}</span>
              {': '}
              <span className="st">{'"2026-02-10T14:22:03Z"'}</span>
              {'\n}'}
            </pre>
          </div>

          <h2 id="doc-reitor">Reitor (fallback)</h2>
          <p>
            O <b>Reitor</b> é a última instância. Quando um tutor fica em dúvida, não encontra a resposta nas fontes ou
            recebe uma pergunta fora do escopo, a conversa é escalada automaticamente para ele.
          </p>
          <p>
            Diferente dos tutores temáticos, o Reitor trabalha em <b>linguagem natural aberta</b>, mas{' '}
            <b>sempre ancorado na base de conhecimento de todos os tutores</b>, ele não inventa: se a informação não
            existe nas fontes, é honesto sobre isso e orienta o próximo passo (falar com a secretaria, abrir um chamado).
            Configure o tom dele no card <b>Reitor</b> da tela de Tutores.
          </p>
          <div className="callout">
            <Icon name="crown" />
            <div>Pense no Reitor como a rede de segurança da experiência: o visitante nunca fica sem resposta.</div>
          </div>

          <h2 id="doc-security">Segurança & token</h2>
          <p>
            O <b>token de embed</b> identifica o tutor no snippet. Ele não é um segredo absoluto (fica no HTML público),
            por isso a proteção real vem das <b>origens permitidas</b>: só os domínios que você autorizar conseguem
            carregar o widget.
          </p>
          <p>
            Para integrações server-side, use a <b>chave de API</b> em Configurações, essa sim deve ficar apenas no seu
            servidor, nunca no front-end.
          </p>

          <h2 id="doc-faq">Dúvidas frequentes</h2>
          <div className="faq">
            <b>O tutor pode inventar respostas?</b>Ele é orientado a responder só com base nas fontes e instruções.
            Reforçe nas instruções para recusar o que estiver fora do escopo.
          </div>
          <div className="faq">
            <b>Posso ter vários tutores no mesmo site?</b>Sim. Cada um tem seu token e snippet, embuta quantos precisar,
            em páginas diferentes.
          </div>
          <div className="faq">
            <b>O widget funciona no mobile?</b>Sim, é responsivo de 320 a 420px+ e se adapta ao container do iframe.
          </div>
          <div className="faq">
            <b>Como desativo um tutor temporariamente?</b>Use o toggle de status ou a ação de desativar na lista. O widget
            passa a exibir um aviso e para de responder.
          </div>

          <a className="doc-back" onClick={() => navigate('/admin')}>
            <Icon name="arrow-left" /> Voltar para Tutores
          </a>
        </div>
      </div>
    </section>
  );
}
