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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients = rawJob.job_clients?.map((jc: any) => jc.clients).filter(Boolean) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client_name = clients.map((c: any) => c.name).join(', ') || null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client_ids = clients.map((c: any) => c.id);

  return {
    ...rawJob,
    clients,
    client_ids,
    client_name,
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
    reportage_links:
      rawJob.job_reportage_links?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (jrl: any) => jrl.reportage_links,
      ).filter(Boolean) || [],
  };
}

const JOB_SELECT = `
  *,
  job_clients(client_id, clients(*)),
  job_commercial_categories(category_id, commercial_categories(*)),
  job_tags_junction(tag_id, job_tags(*)),
  job_reportage_links(link_id, reportage_links(*))
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
// Helper: Sync Clients Junction
// ----------------------------------------------------------------

async function syncJobClients(jobId: string, clientIds: string[]) {
  await supabase!.from('job_clients').delete().eq('job_id', jobId);
  if (!clientIds || clientIds.length === 0) return;

  const rows = clientIds.map((clientId) => ({
    job_id: jobId,
    client_id: clientId,
  }));
  const { error } = await supabase!.from('job_clients').insert(rows);
  if (error) {
    console.error('Error syncing job clients:', error);
    throw error;
  }
}

// ----------------------------------------------------------------
// Helper: Save Reportage Links
// ----------------------------------------------------------------

async function syncReportageLinks(jobId: string, links?: Array<{ url: string; title: string; provider?: string | null; published_date?: string | null }>) {
  // Delete existing junctions for this job
  await supabase!.from('job_reportage_links').delete().eq('job_id', jobId);

  if (!links || links.length === 0) return;

  for (const link of links) {
    if (!link.url || !link.url.trim()) continue;

    // Insert or resolve link record
    const { data: insertedLink, error: linkError } = await supabase!
      .from('reportage_links')
      .insert([
        {
          url: link.url.trim(),
          title: link.title.trim() || 'Reportagem',
          provider: link.provider || null,
          published_date: link.published_date || null,
        },
      ])
      .select('id')
      .single();

    if (linkError) {
      console.error('Error inserting reportage link:', linkError);
      continue;
    }

    if (insertedLink?.id) {
      await supabase!.from('job_reportage_links').insert([
        {
          job_id: jobId,
          link_id: insertedLink.id,
        },
      ]);
    }
  }
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

  // Insert client junctions
  if (formData.client_ids && formData.client_ids.length > 0) {
    await syncJobClients(newJob.id, formData.client_ids);
  }

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

  // Insert reportage links
  if (formData.reportage_links && formData.reportage_links.length > 0) {
    await syncReportageLinks(newJob.id, formData.reportage_links);
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

  // Sync client junctions
  if (formData.client_ids !== undefined) {
    await syncJobClients(id, formData.client_ids);
  }

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

  // Sync reportage links
  if (formData.reportage_links !== undefined) {
    await syncReportageLinks(id, formData.reportage_links);
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
