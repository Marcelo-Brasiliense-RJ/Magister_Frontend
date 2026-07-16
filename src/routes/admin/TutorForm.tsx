import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '@/lib/api';
import type { Tutor, TutorInput } from '@/lib/types';
import { Button, Input, Textarea, Toggle, Spinner, useToast } from '@/components/ui';
import './admin.css';

const EMPTY: TutorInput = {
  title: '',
  description: '',
  system_instructions: '',
  sources: [],
  allowed_origins: [],
};

export function TutorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<TutorInput>(EMPTY);
  const [status, setStatus] = useState<Tutor['status']>('active');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; system_instructions?: string }>({});

  useEffect(() => {
    if (!id) return;
    api
      .getTutor(id)
      .then((t) => {
        setForm({
          title: t.title,
          description: t.description,
          system_instructions: t.system_instructions,
          sources: t.sources,
          allowed_origins: t.allowed_origins,
        });
        setStatus(t.status);
      })
      .catch((e) => toast.push('error', e instanceof Error ? e.message : 'Falha ao carregar.'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = 'Informe um titulo.';
    if (!form.system_instructions.trim()) next.system_instructions = 'Informe as instrucoes.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Remove URLs vazias antes de enviar.
    const payload: TutorInput = {
      ...form,
      sources: form.sources.map((s) => s.trim()).filter(Boolean),
      allowed_origins: form.allowed_origins.map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.updateTutor(id, payload);
        toast.push('success', 'Tutor atualizado.');
      } else {
        await api.createTutor(payload);
        toast.push('success', 'Tutor criado.');
      }
      navigate('/admin');
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (active: boolean) => {
    if (!id) return;
    const nextStatus = active ? 'active' : 'inactive';
    setStatus(nextStatus);
    try {
      await api.setTutorStatus(id, nextStatus);
      toast.push('success', active ? 'Tutor ativado.' : 'Tutor desativado.');
    } catch (err) {
      setStatus(active ? 'inactive' : 'active');
      toast.push('error', err instanceof Error ? err.message : 'Falha ao atualizar status.');
    }
  };

  if (loading) {
    return (
      <main className="page">
        <Spinner label="Carregando tutor" />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__header">
        <h1 className="page__title">{isEdit ? 'Editar tutor' : 'Novo tutor'}</h1>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <Input
          label="Titulo"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
          maxLength={120}
        />
        <Input
          label="Descricao curta"
          hint="Exibida como apoio; opcional."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={240}
        />
        <Textarea
          label="Instrucoes do sistema"
          hint="Persona e regras do tutor."
          rows={8}
          value={form.system_instructions}
          onChange={(e) => setForm({ ...form, system_instructions: e.target.value })}
          error={errors.system_instructions}
        />

        <UrlListEditor
          label="Fontes (URLs)"
          hint="URLs http/https que o tutor pode consultar."
          values={form.sources}
          onChange={(sources) => setForm({ ...form, sources })}
        />
        <UrlListEditor
          label="Origens permitidas"
          hint="Dominios autorizados a embutir o widget. Vazio = sem restricao adicional."
          values={form.allowed_origins}
          onChange={(allowed_origins) => setForm({ ...form, allowed_origins })}
        />

        {isEdit && (
          <Toggle
            checked={status === 'active'}
            onChange={toggleStatus}
            label={status === 'active' ? 'Ativo' : 'Inativo'}
          />
        )}

        <div className="form__actions">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>
            Cancelar
          </Button>
        </div>
      </form>
    </main>
  );
}

// Editor de lista de URLs (adicionar/remover). Uso interno do formulario.
function UrlListEditor({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const update = (i: number, v: string) => onChange(values.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, '']);

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <span className="field__hint">{hint}</span>
      <div className="source-list">
        {values.map((v, i) => (
          <div className="source-row" key={i}>
            <Input
              type="url"
              placeholder="https://exemplo.com/pagina"
              value={v}
              onChange={(e) => update(i, e.target.value)}
              aria-label={`${label} ${i + 1}`}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              Remover
            </Button>
          </div>
        ))}
      </div>
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          Adicionar URL
        </Button>
      </div>
    </div>
  );
}
