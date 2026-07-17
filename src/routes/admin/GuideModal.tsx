import { useState } from 'react';
import { Icon } from './Icon';

// Modal "Como usar o Magister" (auto-abre na primeira entrada; dispensavel).
export function GuideModal({
  open,
  onClose,
  onDocs,
}: {
  open: boolean;
  onClose: (dontShow: boolean) => void;
  onDocs: () => void;
}) {
  const [dontShow, setDontShow] = useState(false);
  if (!open) return null;
  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(dontShow);
      }}
    >
      <div className="modal" style={{ width: 560, maxWidth: 'calc(100vw - 32px)' }} role="dialog" aria-modal="true">
        <div className="mh" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="mic" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
              <Icon name="compass" />
            </span>
            <h3>Como usar o Magister</h3>
          </div>
          <button className="icon-btn" onClick={() => onClose(dontShow)} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
        <p>Em 4 passos você coloca um tutor de IA no ar:</p>
        <ol className="doc-list" style={{ marginTop: 4 }}>
          <li>
            <span className="num">1</span> <b>Crie um tutor</b> em Tutores › Novo tutor.
          </li>
          <li>
            <span className="num">2</span> Escreva as <b>instruções</b> e adicione as <b>fontes</b> (URLs).
          </li>
          <li>
            <span className="num">3</span> Escolha o <b>modelo de IA</b>, ou toque em “Sugerir modelo”.
          </li>
          <li>
            <span className="num">4</span> Copie o <b>snippet de embed</b> e cole no seu site.
          </li>
        </ol>
        <div className="callout" style={{ margin: '16px 0 0' }}>
          <Icon name="crown" />
          <div>
            O <b>Reitor</b> cobre o que os tutores não sabem, e responde <b>sempre ancorado no conhecimento dos outros tutores</b>, sem inventar (nada de alucinação). O visitante nunca fica sem resposta.
          </div>
        </div>
        <div className="mf" style={{ marginTop: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="guide-skip">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} /> Não mostrar novamente
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onDocs}>
              Ver documentação
            </button>
            <button className="btn btn-primary" onClick={() => onClose(dontShow)}>
              <Icon name="rocket" /> Começar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
