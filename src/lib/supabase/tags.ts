import { supabase } from './client';
import { JobTag } from '@/types/database';

export async function getJobTags(): Promise<JobTag[]> {
  const { data, error } = await supabase!
    .from('job_tags')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createJobTag(name: string, color: string): Promise<JobTag> {
  const { data, error } = await supabase!
    .from('job_tags')
    .insert([{ name, color }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJobTag(
  id: string,
  name: string,
  color: string,
): Promise<void> {
  const { error } = await supabase!
    .from('job_tags')
    .update({ name, color })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteJobTag(id: string): Promise<void> {
  const { error } = await supabase!
    .from('job_tags')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
