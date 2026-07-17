import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { mapApiTutor, type ModelId, type Tutor } from './data';
import * as api from '@/lib/api';
import { ApiError, clearToken, getToken } from '@/lib/api';
import { Spinner } from '@/components/ui';

export type ToastKind = 'ok' | 'err' | 'info';
export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  msg: string;
}

export interface SaveInput {
  id?: number;
  name: string;
  desc: string;
  active: boolean;
  sourceUrls: string[];
  origins: string[];
  instr?: string;
  model: ModelId; // presentacional: o backend roteia por custo, nao persiste modelo
  fallbackEnabled: boolean;
}

interface MagisterContextValue {
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;

  tutors: Tutor[];
  getTutor: (id: number) => Tutor | undefined;
  saveTutor: (input: SaveInput) => Promise<void>;
  toggleTutor: (id: number) => Promise<void>;

  toasts: Toast[];
  toast: (kind: ToastKind, title: string, msg: string) => void;
  dismissToast: (id: number) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}

const Ctx = createContext<MagisterContextValue | null>(null);

export function MagisterProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => !!getToken());
  // booted: primeira carga de tutores concluida (garante a lista antes das telas).
  const [booted, setBooted] = useState<boolean>(() => !getToken());
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('magister_theme') as 'light' | 'dark') || 'light',
  );
  const nextId = useRef(1);

  // Aplica o tema no <html>; os tokens escopados reagem a [data-theme="dark"] .magister.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('magister_theme', theme);
  }, [theme]);

  const loadTutors = useCallback(async () => {
    const list = await api.listTutors();
    setTutors(list.map(mapApiTutor));
  }, []);

  // Carga inicial quando ha token (deep-link/refresh). Token invalido derruba a sessao.
  useEffect(() => {
    if (!getToken()) return;
    loadTutors()
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          clearToken();
          setIsAuthed(false);
        }
      })
      .finally(() => setBooted(true));
  }, [loadTutors]);

  const login = useCallback(
    async (username: string, password: string) => {
      const token = await api.login(username, password);
      api.setToken(token);
      await loadTutors(); // carrega antes de liberar as telas que assumem a lista pronta
      setIsAuthed(true);
      setBooted(true);
    },
    [loadTutors],
  );

  const logout = useCallback(() => {
    clearToken();
    setIsAuthed(false);
    setTutors([]);
  }, []);

  const getTutor = useCallback((id: number) => tutors.find((t) => t.id === id), [tutors]);

  const saveTutor = useCallback(
    async (input: SaveInput) => {
      const payload = {
        title: input.name,
        description: input.desc,
        system_instructions: input.instr ?? '',
        sources: input.sourceUrls,
        allowed_origins: input.origins,
        fallback_enabled: input.fallbackEnabled,
      };
      if (input.id) {
        await api.updateTutor(input.id, payload);
        const current = tutors.find((t) => t.id === input.id);
        // Status vive numa rota propria (PATCH); so chama se o toggle mudou.
        if (current && current.active !== input.active) {
          await api.setTutorStatus(input.id, input.active ? 'active' : 'inactive');
        }
      } else {
        const created = await api.createTutor(payload);
        if (!input.active) {
          await api.setTutorStatus(created.id, 'inactive');
        }
      }
      await loadTutors();
    },
    [tutors, loadTutors],
  );

  const toggleTutor = useCallback(
    async (id: number) => {
      const current = tutors.find((t) => t.id === id);
      if (!current) return;
      await api.setTutorStatus(id, current.active ? 'inactive' : 'active');
      await loadTutors();
    },
    [tutors, loadTutors],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (kind: ToastKind, title: string, msg: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, kind, title, msg }]);
      setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast],
  );

  const setTheme = useCallback((t: 'light' | 'dark') => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value: MagisterContextValue = {
    isAuthed,
    login,
    logout,
    tutors,
    getTutor,
    saveTutor,
    toggleTutor,
    toasts,
    toast,
    dismissToast,
    theme,
    toggleTheme,
    setTheme,
  };

  // Segura as telas ate a primeira carga de tutores (evita formularios vazios em refresh).
  if (isAuthed && !booted) {
    return (
      <div className="magister">
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <Spinner label="Carregando painel" />
        </div>
      </div>
    );
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMagister(): MagisterContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMagister deve ser usado dentro de MagisterProvider');
  return ctx;
}
