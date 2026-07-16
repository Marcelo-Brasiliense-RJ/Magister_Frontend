import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Logo } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import './admin.css';

// Guarda de rota + layout do painel. Sem JWT valido, redireciona ao login.
export function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const onLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin">
      <header className="topbar">
        <Logo height={22} />
        <div className="topbar__right">
          <ThemeToggle />
          <span className="topbar__user">admin</span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
