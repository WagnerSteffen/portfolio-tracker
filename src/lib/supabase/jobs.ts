import { supabase } from './client';
import { Job, JobFormData } from '@/types/database';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/**
 * Shapes a raw Supabase row (with nested junction table data) into a Job.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRawJob(rawJob: any): Job {
  return {
    ...rawJob,
    categories:
      rawJob.job_commercial_categories?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (jcc: any) => jcc.commercial_categories,
      ) || [],
    tags:
      rawJob.job_tags_junction?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (jtj: any) => jtj.job_tags,
      ) || [],
  };
}

const JOB_SELECT = `
  *,
  job_commercial_categories(category_id, commercial_categories(*)),
  job_tags_junction(tag_id, job_tags(*))
`;

// ----------------------------------------------------------------
// Read
// ----------------------------------------------------------------

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase!
    .from('jobs')
    .select(JOB_SELECT)
    .order('job_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRawJob);
}

// ----------------------------------------------------------------
// Create
// ----------------------------------------------------------------

export async function createJob(formData: JobFormData): Promise<Job> {
  const { data: newJob, error: jobError } = await supabase!
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

  // Insert category junctions
  if (formData.category_ids.length > 0) {
    const rows = formData.category_ids.map((catId) => ({
      job_id: newJob.id,
      category_id: catId,
    }));
    const { error } = await supabase!
      .from('job_commercial_categories')
      .insert(rows);
    if (error) throw error;
  }

  // Insert tag junctions
  if (formData.tag_ids.length > 0) {
    const rows = formData.tag_ids.map((tagId) => ({
      job_id: newJob.id,
      tag_id: tagId,
    }));
    const { error } = await supabase!.from('job_tags_junction').insert(rows);
    if (error) throw error;
  }

  const allJobs = await getJobs();
  return allJobs.find((j) => j.id === newJob.id) || newJob;
}

// ----------------------------------------------------------------
// Update
// ----------------------------------------------------------------

export async function updateJob(id: string, formData: JobFormData): Promise<Job> {
  const { error: updateError } = await supabase!
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

  // Refresh category junctions (delete + re-insert)
  await supabase!.from('job_commercial_categories').delete().eq('job_id', id);
  if (formData.category_ids.length > 0) {
    const { error } = await supabase!
      .from('job_commercial_categories')
      .insert(
        formData.category_ids.map((catId) => ({ job_id: id, category_id: catId })),
      );
    if (error) throw error;
  }

  // Refresh tag junctions (delete + re-insert)
  await supabase!.from('job_tags_junction').delete().eq('job_id', id);
  if (formData.tag_ids.length > 0) {
    const { error } = await supabase!
      .from('job_tags_junction')
      .insert(formData.tag_ids.map((tagId) => ({ job_id: id, tag_id: tagId })));
    if (error) throw error;
  }

  const allJobs = await getJobs();
  return allJobs.find((j) => j.id === id)!;
}

// ----------------------------------------------------------------
// Delete
// ----------------------------------------------------------------

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase!.from('jobs').delete().eq('id', id);
  if (error) throw error;
}
