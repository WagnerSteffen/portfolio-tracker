import { supabase } from './client';
import { CommercialCategory } from '@/types/database';

export async function getCommercialCategories(): Promise<CommercialCategory[]> {
  const { data, error } = await supabase!
    .from('commercial_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createCommercialCategory(
  name: string,
  color: string,
): Promise<CommercialCategory> {
  const { data, error } = await supabase!
    .from('commercial_categories')
    .insert([{ name, color }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCommercialCategory(
  id: string,
  name: string,
  color: string,
): Promise<void> {
  const { error } = await supabase!
    .from('commercial_categories')
    .update({ name, color })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCommercialCategory(id: string): Promise<void> {
  const { error } = await supabase!
    .from('commercial_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
