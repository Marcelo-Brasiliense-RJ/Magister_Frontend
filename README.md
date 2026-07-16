# Magister — Frontend

Frontend da plataforma **Magister**: painel administrativo de tutores de IA e widget de
chat embutivel via `<iframe>`. React + Vite + TypeScript.

> Codigo produzido **via agentes de codificacao** (frontend/backend/seguranca), conforme o
> processo do desafio DOT. Este repositorio cobre a superficie de frontend.

## Superficies

- **`/admin`** — painel protegido por **login JWT**: lista de tutores (busca, loading, empty),
  criar/editar (titulo, descricao, instrucoes do sistema, fontes, origens permitidas, status) e
  tela de embed (embed token + snippet `<iframe>` com copiar + preview ao vivo).
- **`/embed?token=<embed_token>`** — alvo do `<iframe>`: renderiza **somente** o widget de chat.
  Consome `POST /api/chat` por **SSE (streaming)**.

## Como subir localmente

Requisitos: Node 18+.

```bash
cd frontend
cp .env.example .env      # ajuste VITE_API_URL se necessario
npm install
npm run dev               # http://localhost:5173
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run format`.

## Variaveis de ambiente

Apenas variaveis `VITE_*` (publicas) chegam ao bundle. **Nenhum segredo no front.**

| Variavel       | Descricao                    | Exemplo                 |
| -------------- | ---------------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API do backend   | `http://localhost:8000` |

## Fluxo de embed ponta a ponta

1. Admin faz login em `/admin` (JWT em `Authorization: Bearer`) e cria um tutor.
2. Em **Embed**, copia o snippet `<iframe src=".../embed?token=<embed_token>">`.
3. O site do integrador cola o snippet. O `<iframe>` carrega `/embed?token=...`.
4. O widget resolve a config publica do tutor pelo token e conversa via `POST /api/chat` (SSE).
5. O **embed token e publico e escopado** ao tutor; instrucoes, fontes e limites vivem no
   servidor. Nada sensivel trafega pelo host pai.

## Estrutura

```
src/
├── main.tsx, App.tsx           # entry + rotas (admin | embed)
├── routes/
│   ├── admin/                  # Login, TutorList, TutorForm, EmbedSnippet, AdminLayout (guarda)
│   └── embed/Widget.tsx        # alvo do iframe (so o chat)
├── components/
│   ├── chat/                   # ChatWindow, MessageList, Composer
│   └── ui/                     # primitivas do design system
├── lib/                        # api.ts (REST), sse.ts (stream), types.ts
├── hooks/                      # useChat (sessao), useAuth (JWT)
├── styles/                     # tokens.css (design system), global.css
└── assets/logo.svg
```

## Contrato da API (esperado do backend)

- `POST /api/auth/login` → `{ access_token }`
- `GET/POST /api/tutors`, `GET/PUT /api/tutors/{id}`, `PATCH /api/tutors/{id}/status`
- `GET /api/tutors/{id}/embed` → `{ embed_token, snippet }`
- `GET /api/embed/{embed_token}` → `{ title, greeting }` (config publica do widget)
- `POST /api/chat` `{ embed_token, session_id?, message }` → **SSE**, eventos:
  `{"type":"session","session_id"}`, `{"type":"token","content"}`, `{"type":"done"}`,
  `{"type":"error","code","message"}`.

## Design system

`src/styles/tokens.css` define variaveis semanticas (tema **claro** principal em `:root`, tema
**escuro** em `[data-theme="dark"]`) derivadas da marca DOT (carvao, marfim, accent teal). A
saida oficial do **Claude Design** (`logo.svg` + `tokens.css`) substitui os placeholders sem
refatorar componentes. O logo atual e um placeholder textual ("Magister").

## Seguranca (itens de frontend)

- **Sem segredos no bundle:** apenas `VITE_*` publicas (URL da API). JWT fica em memoria/
  `localStorage`; chaves de LLM e `JWT_SECRET` nunca chegam ao front.
- **XSS:** toda mensagem, resposta do LLM e nome de tutor sao renderizados como **texto** (React
  escapa). Nao ha `dangerouslySetInnerHTML` com dado nao confiavel.
- **Confianca no servidor:** o widget envia so `embed_token` + mensagem; identidade, instrucoes,
  fontes e limites sao resolvidos no backend.

## Acessibilidade

Foco visivel, alvos interativos >=44px, `prefers-reduced-motion` respeitado, `aria-live` nos
toasts, dialog de confirmacao com foco gerenciado e fechamento por `Esc`.

## Limitacoes do MVP

- Um unico admin (sem gestao de usuarios); sessao via `localStorage` sem refresh token.
- Rate limit / orcamento de tokens sao aplicados pelo backend; o front apenas reflete os estados
  (`rate_limited`, `limit_reached`).
- Sem testes automatizados nesta camada (o ponto critico coberto por testes e o backend); a
  verificacao aqui e `lint` + `build`.

## Proximos passos

- Substituir os placeholders pela saida do Claude Design (logo + tokens).
- Refresh token / expiracao de sessao com renovacao silenciosa.
- Testes de componente (widget e formulario) e e2e do fluxo de embed.
- Markdown seguro na resposta do LLM (via DOMPurify) se necessario.
