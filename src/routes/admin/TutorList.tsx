import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '@/lib/api';
import type { Tutor } from '@/lib/types';
import { Button, Input, StatusPill, ConfirmModal, useToast } from '@/components/ui';
import './admin.css';

export function TutorList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tutors, setTutors] = useState<Tutor[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Tutor | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError(null);
    api
      .listTutors()
      .then(setTutors)
      .catch((e) => setError(e.message ?? 'Falha ao carregar tutores.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!tutors) return [];
    const q = query.trim().toLowerCase();
    return q ? tutors.filter((t) => t.title.toLowerCase().includes(q)) : tutors;
  }, [tutors, query]);

  // Ativa direto; desativar exige confirmacao.
  const onToggleStatus = (t: Tutor) => {
    if (t.status === 'active') {
      setConfirming(t);
    } else {
      void applyStatus(t, 'active');
    }
  };

  const applyStatus = async (t: Tutor, status: Tutor['status']) => {
    setBusy(true);
    try {
      const updated = await api.setTutorStatus(t.id, status);
      setTutors((list) => list?.map((x) => (x.id === t.id ? updated : x)) ?? null);
      toast.push('success', status === 'active' ? 'Tutor ativado.' : 'Tutor desativado.');
    } catch (e) {
      toast.push('error', e instanceof Error ? e.message : 'Falha ao atualizar status.');
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">Tutores</h1>
        <Button onClick={() => navigate('/admin/tutors/new')}>Novo tutor</Button>
      </div>

      <div className="toolbar">
        <Input
          placeholder="Buscar por titulo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar tutores"
        />
      </div>

      {error && (
        <div className="login__error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
          {error} <button className="btn btn--ghost btn--sm" onClick={load}>Recarregar</button>
        </div>
      )}

      {tutors === null && !error ? (
        <div>
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          {query ? 'Nenhum tutor encontrado para a busca.' : 'Nenhum tutor ainda. Crie o primeiro.'}
        </div>
      ) : (
        <table className="tutor-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                {/* Titulo do tutor renderizado como texto. */}
                <td className="tutor-table__title">{t.title}</td>
                <td>
                  <StatusPill status={t.status} />
                </td>
                <td>
                  <div className="tutor-table__actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/tutors/${t.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/tutors/${t.id}/embed`)}
                    >
                      Embed
                    </Button>
                    <Button
                      variant={t.status === 'active' ? 'ghost' : 'primary'}
                      size="sm"
                      onClick={() => onToggleStatus(t)}
                    >
                      {t.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirming && (
        <ConfirmModal
          title="Desativar tutor"
          danger
          loading={busy}
          confirmLabel="Desativar"
          onConfirm={() => applyStatus(confirming, 'inactive')}
          onCancel={() => setConfirming(null)}
        >
          O tutor <strong>{confirming.title}</strong> deixara de responder no widget. Voce pode
          reativar depois.
        </ConfirmModal>
      )}
    </main>
  );
}
