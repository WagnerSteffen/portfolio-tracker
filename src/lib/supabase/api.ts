import { supabase, isSupabaseConfigured } from './client';
import {
  Job,
  JobFormData,
  CommercialCategory,
  JobTag,
  CustomFieldDefinition,
  PerformerType,
  JobStatus,
} from '@/types/database';

// ----------------------------------------------------
// Mock initial dataset for instant preview/demo mode
// ----------------------------------------------------
let MOCK_CATEGORIES: CommercialCategory[] = [
  { id: 'cat-1', name: 'B2C', color: '#10b981', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'B2B', color: '#3b82f6', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Projeto', color: '#8b5cf6', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Edital', color: '#f59e0b', created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Institucional', color: '#ec4899', created_at: new Date().toISOString() },
];

let MOCK_TAGS: JobTag[] = [
  { id: 'tag-1', name: 'Fotografia Ensaio', color: '#06b6d4', created_at: new Date().toISOString() },
  { id: 'tag-2', name: 'Evento / Casamento', color: '#f43f5e', created_at: new Date().toISOString() },
  { id: 'tag-3', name: 'Vídeo / Reel', color: '#a855f7', created_at: new Date().toISOString() },
  { id: 'tag-4', name: 'Branding / Identidade', color: '#eab308', created_at: new Date().toISOString() },
  { id: 'tag-5', name: 'Design Gráfico', color: '#3b82f6', created_at: new Date().toISOString() },
  { id: 'tag-6', name: 'Oficina / Workshop', color: '#14b8a6', created_at: new Date().toISOString() },
];

let MOCK_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: 'cf-1', label: 'Câmera / Equipamento', key: 'camera_used', field_type: 'text', options: [] },
  { id: 'cf-2', label: 'Qtd. Fotos Entregues', key: 'delivered_photos', field_type: 'number', options: [] },
  { id: 'cf-3', label: 'Local do Acervo', key: 'storage_location', field_type: 'select', options: ['HD Externo A', 'HD Externo B', 'Nuvem Drive'] },
];

let MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Ensaio Fotográfico Retrato de Marca - Carol Silva',
    client_name: 'Carol Silva Arquitetura',
    performer: 'wagner',
    job_date: '2026-06-15',
    location: 'Florianópolis, SC',
    drive_url: 'https://drive.google.com/drive/folders/sample-folder-1',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    value: 2800.0,
    status: 'completed',
    description: 'Ensaio fotográfico de posicionamento de imagem pessoal e profissional para redes sociais e site.',
    custom_fields: {
      camera_used: 'Sony A7 IV + 85mm f1.4',
      delivered_photos: 45,
      storage_location: 'Nuvem Drive',
    },
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[1]], // B2C, B2B
    tags: [MOCK_TAGS[0], MOCK_TAGS[3]], // Fotografia Ensaio, Branding
    created_at: new Date().toISOString(),
  },
  {
    id: 'job-2',
    title: 'Identidade Visual & Curadoria Cultural Aflora',
    client_name: 'Espaço Cultural Floripa',
    performer: 'aflora',
    job_date: '2026-07-02',
    location: 'São José, SC',
    drive_url: 'https://drive.google.com/drive/folders/sample-folder-2',
    youtube_url: '',
    value: 5500.0,
    status: 'completed',
    description: 'Desenvolvimento de identidade de marca, sinalização física para a exposição e curadoria gráfica.',
    custom_fields: {
      storage_location: 'HD Externo A',
    },
    categories: [MOCK_CATEGORIES[2], MOCK_CATEGORIES[3]], // Projeto, Edital
    tags: [MOCK_TAGS[3], MOCK_TAGS[4]], // Branding, Design Gráfico
    created_at: new Date().toISOString(),
  },
  {
    id: 'job-3',
    title: 'Produção Audiovisual & Cobertura de Evento Cultural',
    client_name: 'Festival Primavera da Arte',
    performer: 'joint',
    job_date: '2026-07-20',
    location: 'Centro Histórico - Florianópolis',
    drive_url: 'https://drive.google.com/drive/folders/sample-folder-3',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    value: 8200.0,
    status: 'in_progress',
    description: 'Cobertura fotográfica completa (Wagner) e produção de vídeo de resumo com design das peças (Daiana & Aflora).',
    custom_fields: {
      camera_used: 'Sony A7S III + FX3',
      delivered_photos: 120,
      storage_location: 'Nuvem Drive',
    },
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[2]], // B2B, Projeto
    tags: [MOCK_TAGS[0], MOCK_TAGS[1], MOCK_TAGS[2]], // Fotografia, Evento, Vídeo
    created_at: new Date().toISOString(),
  },
  {
    id: 'job-4',
    title: 'Design Editorial e Ilustração de Livro Autoral',
    client_name: 'Editora Terceira Margem',
    performer: 'daiana',
    job_date: '2026-05-10',
    location: 'Remoto',
    drive_url: 'https://drive.google.com/drive/folders/sample-folder-4',
    youtube_url: '',
    value: 4200.0,
    status: 'completed',
    description: 'Projeto gráfico completo, projeto de capa, diagramação e ilustrações internas.',
    custom_fields: {
      storage_location: 'HD Externo B',
    },
    categories: [MOCK_CATEGORIES[2]], // Projeto
    tags: [MOCK_TAGS[4]], // Design Gráfico
    created_at: new Date().toISOString(),
  },
];

// Helper to save mock state to localStorage if in browser
const getStoredData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(`portfolio_db_${key}`);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
};

const setStoredData = <T>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`portfolio_db_${key}`, JSON.stringify(data));
  }
};

// ----------------------------------------------------
// Commercial Categories API
// ----------------------------------------------------
export async function getCommercialCategories(): Promise<CommercialCategory[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('commercial_categories').select('*').order('name');
    if (error) {
      console.warn('Supabase categories request note:', error.message || error);
      return getStoredData('categories', MOCK_CATEGORIES);
    }
    return data || [];
  }
  return getStoredData('categories', MOCK_CATEGORIES);
}

export async function createCommercialCategory(name: string, color: string): Promise<CommercialCategory> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('commercial_categories')
      .insert([{ name, color }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const current = getStoredData('categories', MOCK_CATEGORIES);
  const newCat: CommercialCategory = {
    id: `cat-${Date.now()}`,
    name,
    color,
    created_at: new Date().toISOString(),
  };
  const updated = [...current, newCat];
  setStoredData('categories', updated);
  MOCK_CATEGORIES = updated;
  return newCat;
}

export async function updateCommercialCategory(id: string, name: string, color: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('commercial_categories')
      .update({ name, color })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('categories', MOCK_CATEGORIES);
  const updated = current.map((c) => (c.id === id ? { ...c, name, color } : c));
  setStoredData('categories', updated);
  MOCK_CATEGORIES = updated;
}

export async function deleteCommercialCategory(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('commercial_categories').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('categories', MOCK_CATEGORIES);
  const updated = current.filter((c) => c.id !== id);
  setStoredData('categories', updated);
  MOCK_CATEGORIES = updated;
}

// ----------------------------------------------------
// Job Tags API
// ----------------------------------------------------
export async function getJobTags(): Promise<JobTag[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('job_tags').select('*').order('name');
    if (error) {
      console.error('Supabase error fetching tags:', error);
      return getStoredData('tags', MOCK_TAGS);
    }
    return data || [];
  }
  return getStoredData('tags', MOCK_TAGS);
}

export async function createJobTag(name: string, color: string): Promise<JobTag> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('job_tags')
      .insert([{ name, color }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const current = getStoredData('tags', MOCK_TAGS);
  const newTag: JobTag = {
    id: `tag-${Date.now()}`,
    name,
    color,
    created_at: new Date().toISOString(),
  };
  const updated = [...current, newTag];
  setStoredData('tags', updated);
  MOCK_TAGS = updated;
  return newTag;
}

export async function updateJobTag(id: string, name: string, color: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('job_tags').update({ name, color }).eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('tags', MOCK_TAGS);
  const updated = current.map((t) => (t.id === id ? { ...t, name, color } : t));
  setStoredData('tags', updated);
  MOCK_TAGS = updated;
}

export async function deleteJobTag(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('job_tags').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('tags', MOCK_TAGS);
  const updated = current.filter((t) => t.id !== id);
  setStoredData('tags', updated);
  MOCK_TAGS = updated;
}

// ----------------------------------------------------
// Custom Field Definitions API
// ----------------------------------------------------
export async function getCustomFieldDefinitions(): Promise<CustomFieldDefinition[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('custom_field_definitions').select('*').order('created_at');
    if (error) {
      console.error('Supabase error fetching field definitions:', error);
      return getStoredData('custom_fields', MOCK_CUSTOM_FIELDS);
    }
    return data || [];
  }
  return getStoredData('custom_fields', MOCK_CUSTOM_FIELDS);
}

export async function createCustomFieldDefinition(
  label: string,
  key: string,
  field_type: CustomFieldDefinition['field_type'],
  options: string[] = []
): Promise<CustomFieldDefinition> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .insert([{ label, key, field_type, options }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const current = getStoredData('custom_fields', MOCK_CUSTOM_FIELDS);
  const newField: CustomFieldDefinition = {
    id: `cf-${Date.now()}`,
    label,
    key,
    field_type,
    options,
    created_at: new Date().toISOString(),
  };
  const updated = [...current, newField];
  setStoredData('custom_fields', updated);
  MOCK_CUSTOM_FIELDS = updated;
  return newField;
}

export async function deleteCustomFieldDefinition(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('custom_field_definitions').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('custom_fields', MOCK_CUSTOM_FIELDS);
  const updated = current.filter((f) => f.id !== id);
  setStoredData('custom_fields', updated);
  MOCK_CUSTOM_FIELDS = updated;
}

// ----------------------------------------------------
// Jobs API (CRUD & Filtering)
// ----------------------------------------------------
export async function getJobs(): Promise<Job[]> {
  if (isSupabaseConfigured() && supabase) {
    // Query jobs with joined categories and tags via junction tables
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        job_commercial_categories(category_id, commercial_categories(*)),
        job_tags_junction(tag_id, job_tags(*))
      `)
      .order('job_date', { ascending: false });

    if (error) {
      console.warn('Supabase jobs request note:', error.message || error);
      return getStoredData('jobs', MOCK_JOBS);
    }

    // Format relational data
    return (data || []).map((rawJob: any) => ({
      ...rawJob,
      categories: rawJob.job_commercial_categories?.map((jcc: any) => jcc.commercial_categories) || [],
      tags: rawJob.job_tags_junction?.map((jtj: any) => jtj.job_tags) || [],
    }));
  }

  return getStoredData('jobs', MOCK_JOBS);
}

export async function createJob(formData: JobFormData): Promise<Job> {
  if (isSupabaseConfigured() && supabase) {
    // 1. Insert main job record
    const { data: newJob, error: jobError } = await supabase
      .from('jobs')
      .insert([
        {
          title: formData.title,
          client_name: formData.client_name,
          performer: formData.performer,
          job_date: formData.job_date,
          location: formData.location,
          drive_url: formData.drive_url,
          youtube_url: formData.youtube_url,
          value: formData.value,
          status: formData.status,
          description: formData.description,
          custom_fields: formData.custom_fields,
        },
      ])
      .select()
      .single();

    if (jobError) throw jobError;

    // 2. Insert category junctions
    if (formData.category_ids.length > 0) {
      const categoryRows = formData.category_ids.map((catId) => ({
        job_id: newJob.id,
        category_id: catId,
      }));
      await supabase.from('job_commercial_categories').insert(categoryRows);
    }

    // 3. Insert tag junctions
    if (formData.tag_ids.length > 0) {
      const tagRows = formData.tag_ids.map((tagId) => ({
        job_id: newJob.id,
        tag_id: tagId,
      }));
      await supabase.from('job_tags_junction').insert(tagRows);
    }

    return (await getJobs()).find((j) => j.id === newJob.id) || newJob;
  }

  // Fallback Mock execution
  const categories = (getStoredData('categories', MOCK_CATEGORIES)).filter((c) =>
    formData.category_ids.includes(c.id)
  );
  const tags = (getStoredData('tags', MOCK_TAGS)).filter((t) => formData.tag_ids.includes(t.id));

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title: formData.title,
    client_name: formData.client_name,
    performer: formData.performer,
    job_date: formData.job_date,
    location: formData.location,
    drive_url: formData.drive_url,
    youtube_url: formData.youtube_url,
    value: formData.value,
    status: formData.status,
    description: formData.description,
    custom_fields: formData.custom_fields,
    categories,
    tags,
    created_at: new Date().toISOString(),
  };

  const current = getStoredData('jobs', MOCK_JOBS);
  const updated = [newJob, ...current];
  setStoredData('jobs', updated);
  MOCK_JOBS = updated;
  return newJob;
}

export async function updateJob(id: string, formData: JobFormData): Promise<Job> {
  if (isSupabaseConfigured() && supabase) {
    // 1. Update job details
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        title: formData.title,
        client_name: formData.client_name,
        performer: formData.performer,
        job_date: formData.job_date,
        location: formData.location,
        drive_url: formData.drive_url,
        youtube_url: formData.youtube_url,
        value: formData.value,
        status: formData.status,
        description: formData.description,
        custom_fields: formData.custom_fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Refresh junction tables
    await supabase.from('job_commercial_categories').delete().eq('job_id', id);
    if (formData.category_ids.length > 0) {
      await supabase.from('job_commercial_categories').insert(
        formData.category_ids.map((catId) => ({ job_id: id, category_id: catId }))
      );
    }

    await supabase.from('job_tags_junction').delete().eq('job_id', id);
    if (formData.tag_ids.length > 0) {
      await supabase.from('job_tags_junction').insert(
        formData.tag_ids.map((tagId) => ({ job_id: id, tag_id: tagId }))
      );
    }

    const allJobs = await getJobs();
    return allJobs.find((j) => j.id === id)!;
  }

  // Fallback Mock
  const categories = (getStoredData('categories', MOCK_CATEGORIES)).filter((c) =>
    formData.category_ids.includes(c.id)
  );
  const tags = (getStoredData('tags', MOCK_TAGS)).filter((t) => formData.tag_ids.includes(t.id));

  const current = getStoredData('jobs', MOCK_JOBS);
  const updated = current.map((j) => {
    if (j.id === id) {
      return {
        ...j,
        title: formData.title,
        client_name: formData.client_name,
        performer: formData.performer,
        job_date: formData.job_date,
        location: formData.location,
        drive_url: formData.drive_url,
        youtube_url: formData.youtube_url,
        value: formData.value,
        status: formData.status,
        description: formData.description,
        custom_fields: formData.custom_fields,
        categories,
        tags,
        updated_at: new Date().toISOString(),
      };
    }
    return j;
  });

  setStoredData('jobs', updated);
  MOCK_JOBS = updated;
  return updated.find((j) => j.id === id)!;
}

export async function deleteJob(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  const current = getStoredData('jobs', MOCK_JOBS);
  const updated = current.filter((j) => j.id !== id);
  setStoredData('jobs', updated);
  MOCK_JOBS = updated;
}
