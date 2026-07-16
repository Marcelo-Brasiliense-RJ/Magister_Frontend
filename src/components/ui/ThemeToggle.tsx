import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'magister_theme';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Alterna tema claro/escuro; persiste a escolha. Claro e o padrao.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(KEY) as Theme) || 'light'
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const next = theme === 'light' ? 'dark' : 'light';
  return (
    <button
      className="btn btn--ghost btn--sm"
      onClick={() => setTheme(next)}
      aria-label={`Ativar tema ${next === 'dark' ? 'escuro' : 'claro'}`}
      type="button"
    >
      {theme === 'light' ? 'Escuro' : 'Claro'}
    </button>
  );
}
