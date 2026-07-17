import { Icon } from './Icon';

// Modal de confirmacao (ativar/desativar tutor). Fecha ao clicar no overlay.
export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="mh">
          <div
            className="mic"
            style={
              danger
                ? undefined
                : { background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }
            }
          >
            <Icon name="power" />
          </div>
          <h3>{title}</h3>
        </div>
        <p>{text}</p>
        <div className="mf">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
