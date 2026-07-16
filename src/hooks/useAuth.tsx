// Contexto de auth do admin: guarda o JWT e expoe login/logout reativos.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import * as api from '@/lib/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(api.getToken());

  const login = useCallback(async (username: string, password: string) => {
    const jwt = await api.login(username, password);
    api.setToken(jwt);
    setTokenState(jwt);
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
