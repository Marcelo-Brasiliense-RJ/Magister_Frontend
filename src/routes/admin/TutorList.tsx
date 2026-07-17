import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { ConfirmDialog } from './ConfirmDialog';
import { useMagister } from './store';
import type { Tutor } from './data';

type StatusFilter = 'all' | 'active' | 'inactive';
const FILTER_LABEL: Record<StatusFilter, string> = { all: 'Todos', active: 'Ativos', inactive: 'Inativos' };

// Tela de Tutores: hero + card do Reitor + busca/filtro + tabela (skeleton/empty).
export function TutorList() {
  const navigate = useNavigate();
  const { tutors, toggleTutor, toast } = useMagister();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirming, setConfirming] = useState<Tutor | null>(null);

  // Skeleton na primeira carga (simula latencia, como o design).
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const close = () => setFilterOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [filterOpen]);

  const list = tutors.filter((t) => !t.fallback);
  const reitor = tutors.find((t) => t.fallback);
  const total = list.length;
  const active = list.filter((t) => t.active).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (t) =>
        (statusFilter === 'all' || (statusFilter === 'active' ? t.active : !t.active)) &&
        (t.name + ' ' + t.desc).toLowerCase().includes(q),
    );
  }, [list, query, statusFilter]);

  const onConfirmToggle = async () => {
    if (!confirming) return;
    const newActive = !confirming.active;
    try {
      await toggleTutor(confirming.id);
      toast(newActive ? 'ok' : 'info', newActive ? 'Tutor ativado' : 'Tutor desativado', `“${confirming.name}”, status atualizado.`);
    } catch (e) {
      toast('err', 'Falha ao atualizar', e instanceof Error ? e.message : 'Tente novamente.');
    }
    setConfirming(null);
  };

  return (
    <section className="page">
      <div className="hero">
        <div className="deco" />
        <div>
          <h1>Bom te ver de novo, Rafael</h1>
          <p>
            Você tem <b>{total} {total === 1 ? 'tutor' : 'tutores'}</b>, <b>{active} {active === 1 ? 'ativo' : 'ativos'}</b> respondendo agora.
          </p>
        </div>
        <div className="cta">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/analytics')}>
            <Icon name="bar-chart-3" /> Ver análises
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/tutors/new')}>
            <Icon name="plus" /> Novo tutor
          </button>
        </div>
      </div>

      {reitor && (
        <div className="reitor" onClick={() => navigate(`/admin/tutors/${reitor.id}`)}>
          <div className="glow" />
          <div className="ric">
            <Icon name="crown" />
          </div>
          <div className="rbody">
            <div className="rtitle">
              <b>Reitor</b>
              <span className="rbadge">Fallback · última instância</span>
            </div>
            <div className="rdesc">
              Responde em linguagem natural o que os tutores não sabem, sempre ancorado no que os outros tutores já conhecem, para não inventar respostas. Quando a IA fica em dúvida ou a pergunta foge do escopo, a conversa é escalada para o Reitor.
            </div>
          </div>
          <div className="rright">
            <button
              className="rstat-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/tutors/${reitor.id}?tab=hist`);
              }}
            >
              <b>{reitor.conv}</b>
              <small>escaladas · ver histórico</small>
            </button>
            <button
              className="rbtn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/tutors/${reitor.id}`);
              }}
            >
              <Icon name="settings-2" /> Configurar
            </button>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="searchbox">
          <Icon name="search" />
          <input
            placeholder="Buscar por nome ou descrição…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tutores"
          />
        </div>
        <div className="filter-wrap" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-secondary" onClick={() => setFilterOpen((o) => !o)}>
            <Icon name="sliders-horizontal" /> <span>{statusFilter === 'all' ? 'Status' : FILTER_LABEL[statusFilter]}</span> <Icon name="chevron-down" />
          </button>
          {filterOpen && (
            <div className="filter-menu">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  className={statusFilter === f ? 'on' : ''}
                  onClick={() => {
                    setStatusFilter(f);
                    setFilterOpen(false);
                  }}
                >
                  {FILTER_LABEL[f]}
                  {statusFilter === f && <Icon name="check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        {loading ? (
          <ListSkeleton />
        ) : rows.length === 0 ? (
          <div className="empty">
            <div className="eic">
              <Icon name="search-x" />
            </div>
            <h3>Nenhum resultado</h3>
            <p>Nenhum tutor corresponde a “{query}”. Ajuste a busca ou crie um novo.</p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/tutors/new')}>
              <Icon name="plus" /> Novo tutor
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <span className="srt">
                    Tutor <Icon name="chevron-down" />
                  </span>
                </th>
                <th>
                  <span className="srt">
                    Fontes <Icon name="chevrons-up-down" />
                  </span>
                </th>
                <th>
                  <span className="srt">
                    Atualizado <Icon name="chevrons-up-down" />
                  </span>
                </th>
                <th>
                  <span className="srt">
                    Conversas <Icon name="chevrons-up-down" />
                  </span>
                </th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr className="trow" key={t.id} onClick={() => navigate(`/admin/tutors/${t.id}`)}>
                  <td>
                    <div className="tut">
                      <span className={`tavatar tint-${t.color}`}>
                        <Icon name={t.icon} />
                      </span>
                      <span className="nm">
                        {t.name}
                        <small>{t.desc}</small>
                      </span>
                    </div>
                  </td>
                  <td>{t.sources} URLs</td>
                  <td>{t.updated}</td>
                  <td>{t.conv}</td>
                  <td>
                    {t.active ? (
                      <span className="pill ok">
                        <span className="dot" />
                        Ativo
                      </span>
                    ) : (
                      <span className="pill off">
                        <span className="dot" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="rowactions">
                      <button className="act" title="Editar" onClick={() => navigate(`/admin/tutors/${t.id}`)}>
                        <Icon name="pencil" />
                      </button>
                      <button className="act" title="Embed" onClick={() => navigate(`/admin/tutors/${t.id}?tab=embed`)}>
                        <Icon name="code-xml" />
                      </button>
                      <button className="act dgr" title={t.active ? 'Desativar' : 'Ativar'} onClick={() => setConfirming(t)}>
                        <Icon name="power" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        danger={confirming?.active ?? false}
        title={confirming?.active ? 'Desativar tutor?' : 'Ativar tutor?'}
        confirmLabel={confirming?.active ? 'Desativar' : 'Ativar'}
        text={
          confirming?.active ? (
            <>
              “{confirming?.name}” deixará de responder no widget imediatamente. Você pode reativá-lo quando quiser.
            </>
          ) : (
            <>“{confirming?.name}” voltará a responder no widget imediatamente.</>
          )
        }
        onConfirm={onConfirmToggle}
        onCancel={() => setConfirming(null)}
      />
    </section>
  );
}

// Skeleton de 4 linhas (shimmer), reproduzindo loadList do design.
function ListSkeleton() {
  return (
    <table>
      <tbody>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr className="skrow" key={i}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sk" style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="sk" style={{ height: 12, width: '44%', marginBottom: 7 }} />
                  <div className="sk" style={{ height: 10, width: '30%' }} />
                </div>
              </div>
            </td>
            <td>
              <div className="sk" style={{ height: 12, width: 50 }} />
            </td>
            <td>
              <div className="sk" style={{ height: 12, width: 60 }} />
            </td>
            <td>
              <div className="sk" style={{ height: 12, width: 40 }} />
            </td>
            <td>
              <div className="sk" style={{ height: 22, width: 64, borderRadius: 999 }} />
            </td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
