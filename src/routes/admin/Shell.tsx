import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { MagisterLogo } from './Logo';
import { useMagister } from './store';
import { GuideModal } from './GuideModal';

interface NavDef {
  view: string;
  path: string;
  icon: string;
  label: string;
}

const NAV: NavDef[] = [
  { view: 'list', path: '/admin', icon: 'bot', label: 'Tutores' },
  { view: 'analytics', path: '/admin/analytics', icon: 'bar-chart-3', label: 'Análises' },
  { view: 'docs', path: '/admin/docs', icon: 'book-open', label: 'Documentação' },
  { view: 'settings', path: '/admin/settings', icon: 'settings', label: 'Configurações' },
];

const NOTIFS = [
  { id: 99, tint: 'teal', icon: 'crown', title: 'Reitor recebeu 3 novas escaladas', body: 'Perguntas fora do escopo aguardando revisão.', time: 'há 8 min', unread: true },
  { id: 2, tint: 'amber', icon: 'triangle-alert', title: 'Ajuda Financeira perto do limite', body: '84% do limite de mensagens do mês foi atingido.', time: 'há 1 h', unread: true },
  { id: 4, tint: 'green', icon: 'circle-check', title: 'Tutor publicado', body: '“Onboarding de Calouros” está ativo e respondendo.', time: 'há 3 h', unread: true },
  { id: 1, tint: 'violet', icon: 'globe', title: 'Origem adicionada', body: 'portal.universidade.edu.br foi autorizado.', time: 'ontem', unread: false, tab: 'sources' },
];

// Layout do painel (rail escuro + topbar + conteudo). Guarda de rota: sem login vai ao /admin/login.
export function Shell() {
  const { isAuthed, logout, theme, toggleTheme, toast, getTutor } = useMagister();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [guideOpen, setGuideOpen] = useState(false);

  // Guia "como usar" na primeira entrada (dispensavel por localStorage).
  useEffect(() => {
    if (!isAuthed) return;
    const hidden = localStorage.getItem('magister_guide_hidden') === '1';
    if (!hidden) {
      const t = setTimeout(() => setGuideOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [isAuthed]);

  // Fecha popovers ao clicar fora.
  useEffect(() => {
    const close = () => {
      setUserOpen(false);
      setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (!isAuthed) return <Navigate to="/admin/login" replace />;

  const unread = notifs.filter((n) => n.unread).length;
  const activeView = viewFromPath(location.pathname);

  const onNotifClick = (n: (typeof NOTIFS)[number]) => {
    setNotifs((list) => list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    setNotifOpen(false);
    navigate(`/admin/tutors/${n.id}${n.tab ? `?tab=${n.tab}` : ''}`);
  };

  return (
    <div id="app">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="side-top">
          <span className="side-logo-full">
            <MagisterLogo variant="full" tone="onDark" height={36} />
          </span>
          <span className="side-logo-icon">
            <MagisterLogo variant="icon" height={40} />
          </span>
          <button className="icon-btn collapse-btn" title="Recolher" onClick={() => setCollapsed(true)}>
            <Icon name="panel-left-close" />
          </button>
        </div>
        <div className="navlabel">Workspace</div>
        {NAV.map((n) => (
          <button
            key={n.view}
            className={`nav-item${activeView === n.view ? ' active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </button>
        ))}
        <div className="side-spacer" />
        <div className="usermenu">
          {userOpen && (
            <div className="popover" onClick={(e) => e.stopPropagation()}>
              <div className="pop-head">
                <span className="avatar">RS</span>
                <div>
                  <b>Rafael Souza</b>
                  <small>admin@dot.digital</small>
                </div>
              </div>
              <div className="pop-plan">
                Plano Pro <a onClick={(e) => e.preventDefault()}>Gerenciar</a>
              </div>
              <div className="pop-item">
                <Icon name="user" /> Meu perfil
              </div>
              <div className="pop-item">
                <Icon name="sliders-horizontal" /> Preferências
              </div>
              <div
                className="pop-item"
                onClick={() => {
                  setUserOpen(false);
                  setGuideOpen(true);
                }}
              >
                <Icon name="compass" /> Como usar
              </div>
              <div
                className="pop-item"
                onClick={() => {
                  setUserOpen(false);
                  navigate('/admin/docs');
                }}
              >
                <Icon name="book-open" /> Documentação
              </div>
              <div className="pop-sep" />
              <div className="pop-item danger" onClick={logout}>
                <Icon name="log-out" /> Sair
              </div>
            </div>
          )}
          <button
            className="user-row"
            onClick={(e) => {
              e.stopPropagation();
              setUserOpen((o) => !o);
            }}
          >
            <span className="avatar">RS</span>
            <span className="who">
              <b>Rafael Souza</b>
              <small>DOT Digital</small>
            </span>
            <Icon name="chevrons-up-down" className="chev" style={{ width: 16, height: 16, color: 'var(--color-text-subtle)' }} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" title="Menu" onClick={() => setCollapsed((c) => !c)}>
            <Icon name="menu" />
          </button>
          <Breadcrumb pathname={location.pathname} getTitle={(id) => getTutor(id)?.name} />
          <div className="spacer" />
          <button className="icon-btn" title="Alternar tema" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <div className="notif-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-btn"
              title="Notificações"
              onClick={() => {
                setNotifOpen((o) => !o);
                setUserOpen(false);
              }}
            >
              <Icon name="bell" />
              {unread > 0 && <span className="notif-badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-head">
                  <b>Notificações</b>
                  <button
                    onClick={() => {
                      setNotifs((list) => list.map((n) => ({ ...n, unread: false })));
                      toast('info', 'Notificações', 'Todas marcadas como lidas.');
                    }}
                  >
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="notif-list">
                  {notifs.map((n) => (
                    <div
                      key={n.id + n.title}
                      className={`notif-item${n.unread ? ' unread' : ''}`}
                      onClick={() => onNotifClick(n)}
                    >
                      <span className={`ni tint-${n.tint}`}>
                        <Icon name={n.icon} />
                      </span>
                      <div className="nc">
                        <b>{n.title}</b>
                        <p>{n.body}</p>
                        <span className="nt">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="notif-foot"
                  onClick={() => {
                    setNotifOpen(false);
                    toast('info', 'Notificações', 'Central de notificações, em breve.');
                  }}
                >
                  Ver todas as notificações
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      <GuideModal
        open={guideOpen}
        onClose={(dontShow) => {
          if (dontShow) localStorage.setItem('magister_guide_hidden', '1');
          setGuideOpen(false);
        }}
        onDocs={() => {
          setGuideOpen(false);
          navigate('/admin/docs');
        }}
      />
    </div>
  );
}

function viewFromPath(pathname: string): string {
  if (pathname.startsWith('/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/docs')) return 'docs';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  if (pathname.startsWith('/admin/tutors')) return 'list'; // detalhe destaca "Tutores"
  return 'list';
}

function Breadcrumb({ pathname, getTitle }: { pathname: string; getTitle: (id: number) => string | undefined }) {
  const navigate = useNavigate();
  const view = viewFromPath(pathname);
  const isDetail = pathname.startsWith('/admin/tutors');

  if (view === 'analytics') return <nav className="crumb"><span className="cur">Análises</span></nav>;
  if (view === 'docs') return <nav className="crumb"><span className="cur">Documentação</span></nav>;
  if (view === 'settings') return <nav className="crumb"><span className="cur">Configurações</span></nav>;

  if (isDetail) {
    const idPart = pathname.split('/admin/tutors/')[1]?.split('?')[0];
    const title =
      idPart && idPart !== 'new' ? getTitle(Number(idPart)) ?? 'Tutor' : 'Novo tutor';
    return (
      <nav className="crumb">
        <span className="link" onClick={() => navigate('/admin')}>
          Tutores
        </span>
        <Icon name="chevron-right" className="sep" />
        <span className="cur">{title}</span>
      </nav>
    );
  }
  return <nav className="crumb"><span className="cur">Tutores</span></nav>;
}
