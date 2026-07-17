import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchTutors, seedTutors, type ModelId, type TintColor, type Tutor } from './data';

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
  model: ModelId;
}

interface MagisterContextValue {
  isAuthed: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;

  tutors: Tutor[];
  loading: boolean;
  reload: () => void;
  getTutor: (id: number) => Tutor | undefined;
  saveTutor: (input: SaveInput) => void;
  toggleTutor: (id: number) => void;

  toasts: Toast[];
  toast: (kind: ToastKind, title: string, msg: string) => void;
  dismissToast: (id: number) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}

const Ctx = createContext<MagisterContextValue | null>(null);

// Credencial de demonstracao (auth mockada, como no design).
const DEMO_PASSWORD = 'senha123';

const AVATAR_TINTS: TintColor[] = ['teal', 'violet', 'amber', 'rose', 'green'];

export function MagisterProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => sessionStorage.getItem('magister_auth') === '1',
  );
  const [tutors, setTutors] = useState<Tutor[]>(() => seedTutors());
  const [loading, setLoading] = useState(false);
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

  const login = useCallback((password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (password === DEMO_PASSWORD) {
          sessionStorage.setItem('magister_auth', '1');
          setIsAuthed(true);
          resolve();
        } else {
          reject(new Error('credenciais inválidas'));
        }
      }, 750);
    });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('magister_auth');
    setIsAuthed(false);
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setTutors((current) => {
      void fetchTutors(current).then((list) => {
        setTutors(list);
        setLoading(false);
      });
      return current;
    });
  }, []);

  const getTutor = useCallback((id: number) => tutors.find((t) => t.id === id), [tutors]);

  const saveTutor = useCallback((input: SaveInput) => {
    setTutors((list) => {
      if (input.id) {
        return list.map((t) =>
          t.id !== input.id
            ? t
            : {
                ...t,
                name: input.name,
                desc: input.desc || t.desc,
                active: input.active,
                sourceUrls: input.sourceUrls,
                origins: input.origins,
                sources: input.sourceUrls.length,
                instr: input.instr ?? t.instr,
                model: input.model,
                updated: 'agora',
              },
        );
      }
      const created: Tutor = {
        id: Date.now(),
        name: input.name,
        desc: input.desc || 'sem descrição',
        icon: 'bot',
        color: AVATAR_TINTS[list.length % AVATAR_TINTS.length],
        sources: input.sourceUrls.length,
        sourceUrls: input.sourceUrls,
        origins: input.origins,
        updated: 'agora',
        active: input.active,
        conv: '—',
        res: '—',
        sat: '—',
        tokens: '—',
        cost: '—',
        model: input.model,
        slug: 'novo-tutor',
        token: 'tkn_novo',
        greet: `Olá! Sou o ${input.name}. Como posso ajudar?`,
        q: 'Como você pode ajudar?',
        a: 'Posso responder com base nas fontes cadastradas para este tutor.',
        instr: input.instr,
      };
      return [created, ...list];
    });
  }, []);

  const toggleTutor = useCallback((id: number) => {
    setTutors((list) => list.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  }, []);

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
    loading,
    reload,
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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMagister(): MagisterContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMagister deve ser usado dentro de MagisterProvider');
  return ctx;
}
