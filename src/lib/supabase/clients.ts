import { supabase } from './client';
import { Client } from '@/types/database';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase!
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createClient(
  name: string,
  email?: string,
  phone?: string,
  notes?: string
): Promise<Client> {
  const payload: Record<string, unknown> = { name: name.trim() };
  if (email !== undefined) payload.email = email.trim() || null;
  if (phone !== undefined) payload.phone = phone.trim() || null;
  if (notes !== undefined) payload.notes = notes.trim() || null;

  const { data, error } = await supabase!
    .from('clients')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(
  id: string,
  name: string,
  email?: string,
  phone?: string,
  notes?: string
): Promise<Client> {
  const payload: Record<string, unknown> = {
    name: name.trim(),
    updated_at: new Date().toISOString(),
  };
  if (email !== undefined) payload.email = email.trim() || null;
  if (phone !== undefined) payload.phone = phone.trim() || null;
  if (notes !== undefined) payload.notes = notes.trim() || null;

  const { data, error } = await supabase!
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase!
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
