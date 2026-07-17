import { Icon } from './Icon';
import { useMagister } from './store';

// Tela de configuracoes do workspace (port fiel do design). Blocos: Workspace,
// Aparencia, Membros, Chave de API e Danger zone. Inputs/membros sao estaticos (demo).
export function Settings() {
  const { theme, setTheme, toast } = useMagister();

  return (
    <section className="page" id="view-settings">
      <div className="page-head">
        <div>
          <h1>Configurações</h1>
          <p>Preferências do workspace e da conta.</p>
        </div>
      </div>
      <div className="settings-wrap">
        <div className="card-block">
          <h3>Workspace</h3>
          <p className="desc">Identidade da sua organização no Magister.</p>
          <div className="form-grid">
            <div className="field">
              <label>Nome do workspace</label>
              <input className="ctl" defaultValue="DOT Digital" />
            </div>
            <div className="field">
              <label>Domínio principal</label>
              <input className="ctl" defaultValue="dot.digital" />
            </div>
          </div>
        </div>

        <div className="card-block">
          <h3>Aparência</h3>
          <p className="desc">Escolha o tema do painel.</p>
          <div className="theme-choice">
            {/* A classe `on` reflete o tema atual da store. */}
            <div
              className={`theme-card${theme === 'light' ? ' on' : ''}`}
              data-mode="light"
              onClick={() => setTheme('light')}
            >
              <div className="prev" style={{ background: '#FAFAF8' }} />
              Claro
            </div>
            <div
              className={`theme-card${theme === 'dark' ? ' on' : ''}`}
              data-mode="dark"
              onClick={() => setTheme('dark')}
            >
              <div className="prev" style={{ background: '#0F1419' }} />
              Escuro
            </div>
          </div>
        </div>

        <div className="card-block">
          <h3>Membros</h3>
          <p className="desc">Quem tem acesso a este workspace.</p>
          <div className="member">
            <span className="avatar">RS</span>
            <span className="who">
              <b>Rafael Souza</b>
              <small>admin@dot.digital</small>
            </span>
            <span className="role">Admin</span>
          </div>
          <div className="member">
            <span className="avatar" style={{ background: 'rgba(109,90,224,.15)', color: '#5B48C9' }}>
              MA
            </span>
            <span className="who">
              <b>Marina Alves</b>
              <small>marina@dot.digital</small>
            </span>
            <span className="role">Editor</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 14 }}
            onClick={() => toast('info', 'Membros', 'Convite de membros, em breve.')}
          >
            <Icon name="user-plus" /> Convidar membro
          </button>
        </div>

        <div className="card-block">
          <h3>Chave de API</h3>
          <p className="desc">Para integrações server-side. Mantenha em segredo.</p>
          <div className="apikey">
            <code>sk_live_9f2a•••••••••••c71</code>
            <button
              className="icon-btn"
              onClick={() => toast('info', 'Chave copiada', 'Cole no seu servidor.')}
            >
              <Icon name="copy" />
            </button>
            <button
              className="icon-btn"
              title="Gerar nova"
              onClick={() => toast('info', 'Chave de API', 'Gere uma nova chave, em breve.')}
            >
              <Icon name="rotate-cw" />
            </button>
          </div>
        </div>

        <div className="danger-zone">
          <div className="lbl">
            <b>Excluir workspace</b>
            <small>Remove todos os tutores e dados permanentemente.</small>
          </div>
          <button
            className="btn btn-danger"
            onClick={() => toast('err', 'Excluir workspace', 'Ação sensível, desabilitada nesta demo.')}
          >
            Excluir
          </button>
        </div>
      </div>
    </section>
  );
}
