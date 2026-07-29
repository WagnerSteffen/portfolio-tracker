/**
 * Central re-export barrel for the Supabase API layer.
 *
 * Import from here to keep consumer code decoupled from module internals:
 *   import { getJobs, createJob } from '@/lib/supabase/api';
 */
export * from './jobs';
export * from './categories';
export * from './tags';
export * from './fields';
export * from './clients';
