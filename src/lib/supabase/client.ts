import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Sanitize URL by removing any trailing /rest/v1 or trailing slashes if present
export const supabaseUrl = rawUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

export const supabaseAnonKey = rawAnonKey.trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-supabase-project') &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

/**
 * Supabase client instance.
 * Always initialized — if env vars are missing, requests will throw
 * and be caught by the try/catch wrappers in page.tsx handlers.
 *
 * The `isSupabaseConfigured()` check in the Navbar is used only for
 * displaying the connection status pill to the user.
 */
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : // Fallback: create with placeholder values so TypeScript typing holds.
    // Any request made without real credentials will be caught by error handlers.
    createClient(
      supabaseUrl || 'http://localhost:54321',
      supabaseAnonKey || 'placeholder-key',
    );
