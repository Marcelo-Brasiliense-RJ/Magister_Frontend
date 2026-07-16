import type { TutorStatus } from '@/lib/types';

export function StatusPill({ status }: { status: TutorStatus }) {
  const active = status === 'active';
  return (
    <span className={`pill ${active ? 'pill--active' : 'pill--inactive'}`}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}
