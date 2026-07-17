import { Icon } from './Icon';
import { useMagister, type ToastKind } from './store';

const ICON: Record<ToastKind, string> = { ok: 'check', err: 'circle-alert', info: 'info' };

// Pilha de toasts (canto inferior direito). Auto-dismiss vem do store.
export function Toasts() {
  const { toasts, dismissToast } = useMagister();
  return (
    <div className="toast-stack" id="toastStack">
      {toasts.map((t) => (
        <div className={`toast ${t.kind}`} key={t.id}>
          <span className="tic">
            <Icon name={ICON[t.kind]} />
          </span>
          <div className="body">
            <div className="tt">{t.title}</div>
            <div className="ms">{t.msg}</div>
          </div>
          <button className="x" onClick={() => dismissToast(t.id)} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
      ))}
    </div>
  );
}
