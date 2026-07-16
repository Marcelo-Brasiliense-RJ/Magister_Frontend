import { useRef, useState } from 'react';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled: boolean;
  maxLength?: number;
}

export function Composer({ onSend, disabled, maxLength = 1000 }: ComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  // Enter envia; Shift+Enter quebra linha.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-grow ate o max-height definido no CSS.
  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="composer">
      <textarea
        ref={ref}
        className="composer__input"
        placeholder="Escreva sua mensagem..."
        aria-label="Mensagem"
        rows={1}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onInput={onInput}
      />
      <button
        className="btn btn--primary composer__send"
        onClick={submit}
        disabled={disabled || value.trim() === ''}
        aria-label="Enviar mensagem"
        type="button"
      >
        {/* Icone de envio (traco 1.5). */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12L20 4l-4 16-4-7-8-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
