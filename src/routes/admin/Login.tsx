import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { MagisterLogo } from './Logo';
import { useMagister } from './store';

// Tela de login. Auth real via JWT (POST /api/auth/login). Credencial de demo no README.
export function Login() {
  const { isAuthed, login, theme } = useMagister();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('senha123');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthed) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div id="login">
      <div className="login-card">
        <div className="brand">
          <MagisterLogo variant="full" tone={theme === 'dark' ? 'onDark' : 'onLight'} height={42} />
        </div>
        <h1>Entrar no painel</h1>
        <p className="sub">Gerencie seus tutores de IA embutíveis.</p>
        <form className="login-form" onSubmit={onSubmit} autoComplete="off">
          {error && (
            <div className="cred-error show" role="alert">
              <Icon name="circle-alert" /> Credenciais inválidas. Verifique e tente novamente.
            </div>
          )}
          <div className="field">
            <label htmlFor="lgUser">Usuário</label>
            <input
              className="ctl"
              id="lgUser"
              type="text"
              autoComplete="username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lgPass">Senha</label>
            <input
              className="ctl"
              id="lgPass"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary lg" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spin" /> Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
        <div className="login-foot">Login real via JWT. Credencial de demonstração no README do backend.</div>
      </div>
    </div>
  );
}
