export type PerformerType = 'wagner' | 'daiana' | 'aflora' | 'joint';

export function getJobPerformers(performer?: string | PerformerType[] | null): PerformerType[] {
  if (!performer) return ['wagner'];
  if (Array.isArray(performer)) {
    return performer.length > 0 ? (performer as PerformerType[]) : ['wagner'];
  }
  const split = String(performer)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as PerformerType[];
  return split.length > 0 ? split : ['wagner'];
}

export const PERFORMER_LABELS: Record<PerformerType, { label: string; badgeColor: string; description: string }> = {
  wagner: {
    label: 'Wagner (Fotografia)',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    description: 'Trabalhos autorais de fotografia por Wagner'
  },
  daiana: {
    label: 'Daiana',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Trabalhos e projetos realizados pela Daiana'
  },
  aflora: {
    label: 'Aflora Espaço Criativo',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Projetos da empresa Aflora Espaço Criativo'
  },
  joint: {
    label: 'Parceria / Conjunto',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Trabalhos realizados em conjunto por Wagner, Daiana e Aflora'
  }
};

export type JobStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled';

export const STATUS_LABELS: Record<JobStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  planned: { label: 'Planejado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'Em Andamento', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  completed: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
};

export interface CommercialCategory {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface JobTag {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  key: string;
  field_type: CustomFieldType;
  options?: string[];
  created_at?: string;
}

export interface Job {
  id: string;
  title: string;
  client_name?: string | null;
  performer: PerformerType | string;
  job_date: string;
  location?: string | null;
  drive_url?: string | null;
  youtube_url?: string | null;
  value: number;
  status: JobStatus;
  description?: string | null;
  custom_fields: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  categories?: CommercialCategory[];
  tags?: JobTag[];
}

export interface JobFormData {
  title: string;
  client_name: string;
  performer: PerformerType | string;
  job_date: string;
  location: string;
  drive_url: string;
  youtube_url: string;
  value: number;
  status: JobStatus;
  description: string;
  category_ids: string[];
  tag_ids: string[];
  custom_fields: Record<string, any>;
}
