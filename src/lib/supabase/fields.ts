import { supabase } from './client';
import { CustomFieldDefinition } from '@/types/database';

export async function getCustomFieldDefinitions(): Promise<CustomFieldDefinition[]> {
  const { data, error } = await supabase!
    .from('custom_field_definitions')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function createCustomFieldDefinition(
  label: string,
  key: string,
  field_type: CustomFieldDefinition['field_type'],
  options: string[] = [],
): Promise<CustomFieldDefinition> {
  const { data, error } = await supabase!
    .from('custom_field_definitions')
    .insert([{ label, key, field_type, options }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomFieldDefinition(
  id: string,
  label: string,
  key: string,
  field_type: CustomFieldDefinition['field_type'],
  options: string[] = [],
): Promise<CustomFieldDefinition> {
  const { data, error } = await supabase!
    .from('custom_field_definitions')
    .update({ label, key, field_type, options })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomFieldDefinition(id: string): Promise<void> {
  const { error } = await supabase!
    .from('custom_field_definitions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
