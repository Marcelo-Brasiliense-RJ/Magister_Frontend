import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Logo } from '@/components/ui';
import './admin.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch {
      // Mensagem generica: nao distinguir usuario inexistente de senha errada.
      setError('Usuario ou senha invalidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="card login__card" onSubmit={onSubmit}>
        <div className="login__brand">
          <Logo height={28} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: 'var(--fs-h2)' }}>Painel administrativo</h1>
        {error && (
          <div className="login__error" role="alert">
            {error}
          </div>
        )}
        <Input
          label="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button type="submit" full loading={loading}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
