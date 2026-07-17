import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useMagister } from './store';
import { PERIODS, type Tutor } from './data';

// Definicoes estaticas dos KPIs; o valor (kv) vem de PERIODS[period].kpis[i].
interface KpiDef {
  tint: string;
  icon: string;
  label: string;
  dir: 'up' | 'down';
  delta: string;
  history?: boolean;
}
const KPI_DEFS: KpiDef[] = [
  { tint: 'teal', icon: 'messages-square', label: 'Conversas', dir: 'up', delta: '+12% vs. semana anterior' },
  { tint: 'violet', icon: 'message-circle', label: 'Mensagens', dir: 'up', delta: '+8%' },
  { tint: 'green', icon: 'circle-check-big', label: 'Taxa de resolução', dir: 'up', delta: '+3 pp' },
  { tint: 'amber', icon: 'timer', label: 'Resposta média', dir: 'down', delta: '-0,2s (melhor)' },
  { tint: 'teal', icon: 'crown', label: 'Escaladas ao Reitor', dir: 'up', delta: '+5', history: true },
  { tint: 'violet', icon: 'star', label: 'Satisfação (CSAT)', dir: 'up', delta: '+0,2' },
  { tint: 'green', icon: 'coins', label: 'Custo (tokens)', dir: 'up', delta: '+9%' },
  { tint: 'amber', icon: 'activity', label: 'Requisições', dir: 'up', delta: '+8%' },
];

const TOKEN_LABELS = [
  'Tokens de entrada',
  'Tokens de saída',
  'Requisições',
  'Custo por conversa',
  'Custo total',
];

const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DOW_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtBR = (d: Date | null) =>
  d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '—';

export function Analytics() {
  const { tutors, toast } = useMagister();
  const navigate = useNavigate();

  const [seg, setSeg] = useState<'7' | '30' | '90' | 'custom'>('7');
  const [series, setSeries] = useState<'conv' | 'msg'>('conv');
  const [chartTutor, setChartTutor] = useState<Tutor | null>(null);

  // Calendario do periodo personalizado (mesmos valores iniciais do design).
  const [datePopOpen, setDatePopOpen] = useState(false);
  const [calView, setCalView] = useState(new Date(2026, 1, 1));
  const [rgStart, setRgStart] = useState<Date | null>(new Date(2026, 0, 15));
  const [rgEnd, setRgEnd] = useState<Date | null>(new Date(2026, 1, 10));

  // Fecha o popover do calendario ao clicar fora.
  useEffect(() => {
    if (!datePopOpen) return;
    const close = () => setDatePopOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [datePopOpen]);

  // Periodo personalizado reaproveita os dados de 30 dias.
  const dataPeriod = seg === 'custom' ? '30' : seg;
  const P = PERIODS[dataPeriod];

  const vals = series === 'conv' ? P.conv : P.msg;
  const max = Math.max(...vals);
  const chartTitle =
    (series === 'conv' ? 'Conversas' : 'Mensagens') +
    (dataPeriod === '7' ? ' por dia' : dataPeriod === '30' ? ' por semana' : ' por mês');

  const setPeriod = (p: '7' | '30' | '90') => {
    setSeg(p);
    setDatePopOpen(false);
  };

  const calPick = (y: number, m: number, d: number) => {
    const cur = new Date(y, m, d);
    if (!rgStart || (rgStart && rgEnd)) {
      setRgStart(cur);
      setRgEnd(null);
    } else if (cur < rgStart) {
      setRgEnd(rgStart);
      setRgStart(cur);
    } else {
      setRgEnd(cur);
    }
  };

  const applyCustom = () => {
    setDatePopOpen(false);
    setSeg('custom');
    const lbl = rgStart && rgEnd ? `${fmtBR(rgStart)} a ${fmtBR(rgEnd)}` : rgStart ? fmtBR(rgStart) : 'personalizado';
    toast('info', 'Período personalizado', `${lbl} aplicado.`);
  };

  // Celulas do mes exibido: dias vazados do mes anterior + dias do mes atual.
  const y = calView.getFullYear();
  const m = calView.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  return (
    <section className="page" id="view-analytics">
      <div className="page-head">
        <div>
          <h1>Análises</h1>
          <p>Uso, desempenho e custos dos seus tutores.</p>
        </div>
        <div className="period-wrap">
          <div className="seg" id="periodSeg">
            <button className={seg === '7' ? 'on' : ''} onClick={() => setPeriod('7')}>
              7 dias
            </button>
            <button className={seg === '30' ? 'on' : ''} onClick={() => setPeriod('30')}>
              30 dias
            </button>
            <button className={seg === '90' ? 'on' : ''} onClick={() => setPeriod('90')}>
              90 dias
            </button>
            <button
              title="Período personalizado"
              onClick={(e) => {
                e.stopPropagation();
                setDatePopOpen((o) => !o);
              }}
            >
              <Icon name="calendar" />
            </button>
          </div>
          {datePopOpen && (
            <div className="date-pop" onClick={(e) => e.stopPropagation()}>
              <div className="cal">
                <div className="cal-range-lbl">
                  <div className="rl">
                    <span>De</span>
                    <b>{fmtBR(rgStart)}</b>
                  </div>
                  <div className="rl">
                    <span>Até</span>
                    <b>{fmtBR(rgEnd)}</b>
                  </div>
                </div>
                <div className="cal-head">
                  <b>
                    {MONTHS_PT[m]} de {y}
                  </b>
                  <div className="cal-nav">
                    <button onClick={() => setCalView(new Date(y, m - 1, 1))}>
                      <Icon name="chevron-left" />
                    </button>
                    <button onClick={() => setCalView(new Date(y, m + 1, 1))}>
                      <Icon name="chevron-right" />
                    </button>
                  </div>
                </div>
                <div className="cal-grid">
                  {DOW_PT.map((d, i) => (
                    <div className="cal-dow" key={`dow-${i}`}>
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: startDow }, (_, i) => prevDays - startDow + 1 + i).map((d, i) => (
                    <button className="cal-day mut" disabled key={`mut-${i}`}>
                      {d}
                    </button>
                  ))}
                  {Array.from({ length: daysIn }, (_, i) => i + 1).map((d) => {
                    const cur = new Date(y, m, d);
                    let cls = 'cal-day';
                    if (rgStart && rgEnd && cur > rgStart && cur < rgEnd) cls += ' in-range';
                    if (sameDay(cur, rgStart)) cls += ' range-start';
                    if (sameDay(cur, rgEnd)) cls += ' range-end';
                    if (rgStart && !rgEnd && sameDay(cur, rgStart)) cls += ' range-start range-end';
                    return (
                      <button className={cls} key={`d-${d}`} onClick={() => calPick(y, m, d)}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="cal-foot">
                  <button
                    className="lnk"
                    onClick={() => {
                      setRgStart(null);
                      setRgEnd(null);
                    }}
                  >
                    Limpar
                  </button>
                  <button className="btn btn-primary" style={{ height: 34, padding: '0 16px' }} onClick={applyCustom}>
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stat-grid">
        {KPI_DEFS.map((k, i) => (
          <div
            className={`kpi tint-${k.tint}`}
            key={k.label}
            onClick={k.history ? () => navigate('/admin/tutors/99?tab=hist') : undefined}
            style={k.history ? { cursor: 'pointer' } : undefined}
          >
            <div className="kh">
              <span className="ki">
                <Icon name={k.icon} />
              </span>
              <span className="kl">{k.label}</span>
            </div>
            <div className="kv">{P.kpis[i]}</div>
            <div className={`kd ${k.dir}`}>
              <Icon name={k.dir === 'up' ? 'trending-up' : 'trending-down'} /> {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="usage-grid">
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-head" style={{ marginBottom: 12 }}>
            <h3>Uso de tokens</h3>
            <span className="role">8,1M no período</span>
          </div>
          {TOKEN_LABELS.map((label, i) => (
            <div className="tk-stat" key={label}>
              <span className="k">{label}</span>
              <span className="v" style={i === 4 ? { color: 'var(--color-accent-text)' } : undefined}>
                {P.tokens[i]}
              </span>
            </div>
          ))}
        </div>
        <div className="chart-card" style={{ marginBottom: 0 }}>
          <div className="chart-head" style={{ marginBottom: 16 }}>
            <h3>Modelos usados</h3>
            <span
              className="role has-tip"
              data-tip="O Magister escolhe sozinho o melhor modelo para cada pergunta: usa o mais rápido e econômico nas dúvidas simples e um mais capaz nas complexas."
            >
              <Icon name="info" style={{ width: 13, height: 13 }} /> roteamento automático
            </span>
          </div>
          <div className="mrow">
            <span className="mname">
              <span className="dotc" style={{ background: '#16C0BE' }} />
              Groq · Llama 3.1 8B
            </span>
            <div className="mtrack">
              <div className="mfill" style={{ width: '62%', background: '#16C0BE' }} />
            </div>
            <span className="mpct">62%</span>
          </div>
          <div className="mrow">
            <span className="mname">
              <span className="dotc" style={{ background: '#6D5AE0' }} />
              Groq · Llama 3.3 70B
            </span>
            <div className="mtrack">
              <div className="mfill" style={{ width: '31%', background: '#6D5AE0' }} />
            </div>
            <span className="mpct">31%</span>
          </div>
          <div className="mrow">
            <span className="mname">
              <span className="dotc" style={{ background: '#B8770B' }} />
              OpenRouter (fallback)
            </span>
            <div className="mtrack">
              <div className="mfill" style={{ width: '7%', background: '#B8770B' }} />
            </div>
            <span className="mpct">7%</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            O modelo é escolhido por pergunta conforme a complexidade, perguntas simples usam o mais econômico.
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <h3>{chartTitle}</h3>
          <div className="seg" id="chartSeg">
            <button className={series === 'conv' ? 'on' : ''} onClick={() => setSeries('conv')}>
              Conversas
            </button>
            <button className={series === 'msg' ? 'on' : ''} onClick={() => setSeries('msg')}>
              Mensagens
            </button>
          </div>
        </div>
        <div className="bars">
          {vals.map((v, i) => (
            <div className="bar" key={i}>
              <span className="bv">{v.toLocaleString('pt-BR')}</span>
              <div className="col" style={{ height: `${Math.round((v / max) * 88)}%` }} />
              <span className="bl">{P.labels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-block" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Destaques</h3>
        <div className="insights-grid">
          <div className="ins">
            <span className="ins-ic tint-teal">
              <Icon name="pie-chart" />
            </span>
            <div>
              <b>Matrículas concentra 41%</b> das conversas do período.
            </div>
          </div>
          <div className="ins">
            <span className="ins-ic tint-violet">
              <Icon name="clock" />
            </span>
            <div>
              Pico de uso às <b>terças, 14h–16h</b>.
            </div>
          </div>
          <div className="ins">
            <span className="ins-ic tint-teal">
              <Icon name="crown" />
            </span>
            <div>
              O Reitor resolveu <b>28 de 34</b> dúvidas escaladas.
            </div>
          </div>
          <div className="ins">
            <span className="ins-ic tint-green">
              <Icon name="trending-down" />
            </span>
            <div>
              Custo por conversa caiu <b>6%</b> no último mês.
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Tutor</th>
              <th>Conversas</th>
              <th>Resolução</th>
              <th>Tokens</th>
              <th>Custo</th>
            </tr>
          </thead>
          <tbody>
            {tutors.map((t) => (
              <tr className="trow" key={t.id} onClick={() => setChartTutor(t)}>
                <td>
                  <div className="tut">
                    <span className={`tavatar tint-${t.color || 'teal'}`} style={{ width: 30, height: 30, borderRadius: 8 }}>
                      <Icon name={t.icon} />
                    </span>
                    {/* Nome como texto (sem HTML); selo Fallback para o Reitor. */}
                    <span className="nm" style={{ fontWeight: 600, color: 'var(--color-text-strong)' }}>
                      {t.name}
                      {t.fallback && (
                        <span className="role" style={{ marginLeft: 4 }}>
                          Fallback
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td>{t.conv}</td>
                <td>{t.res}</td>
                <td>{t.tokens}</td>
                <td>{t.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartTutor && <ChartModal tutor={chartTutor} onClose={() => setChartTutor(null)} />}
    </section>
  );
}

// Modal de gasto por dia de um tutor (derivado de t.cost). Sem dados => estado vazio.
function ChartModal({ tutor, onClose }: { tutor: Tutor; onClose: () => void }) {
  const total = parseFloat(String(tutor.cost).replace(/[^0-9,]/g, '').replace(',', '.'));
  const empty = !total || isNaN(total);

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const weights = [0.11, 0.17, 0.13, 0.18, 0.15, 0.15, 0.11];
  const fmt = (n: number) => n.toFixed(2).replace('.', ',');
  const vals = weights.map((w) => total * w);
  const max = Math.max(...vals);

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ width: 560 }} role="dialog" aria-modal="true">
        <div className="mh" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className={`mic tint-${tutor.color || 'teal'}`}>
              <Icon name={tutor.icon} />
            </span>
            <div>
              <h3>{tutor.name}</h3>
              <small style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Gasto por dia (R$) · últimos 7 dias</small>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        {empty ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '34px 0' }}>
            Sem dados suficientes no período.
          </div>
        ) : (
          <>
            <div className="bars" style={{ margin: '10px 0 4px' }}>
              {vals.map((v, i) => (
                <div className="bar" key={i}>
                  <span className="bv">{fmt(v)}</span>
                  <div className="col" style={{ height: `${Math.round((v / max) * 88)}%` }} />
                  <span className="bl">{days[i]}</span>
                </div>
              ))}
            </div>
            <div className="tc-foot">
              <div className="tc-stat">
                <span className="k">Total no período</span>
                <span className="v">{tutor.cost}</span>
              </div>
              <div className="tc-stat">
                <span className="k">Média por dia</span>
                <span className="v">R$ {fmt(total / 7)}</span>
              </div>
              <div className="tc-stat">
                <span className="k">Conversas</span>
                <span className="v">{tutor.conv}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
