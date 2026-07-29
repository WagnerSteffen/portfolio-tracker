/**
 * Request body validation and normalization for the Jobs REST API.
 *
 * Accepts category, tag, and client NAMES (strings) or UUIDs — the agent
 * doesn't need to know database IDs. Names are resolved against the database and
 * created automatically if they don't exist yet.
 */

import { supabase } from '@/lib/supabase/client';
import type {
  JobFormData,
  JobStatus,
  PerformerType,
} from '@/types/database';
import { generateLinkMetadata } from '@/utils/url-title';

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

const VALID_PERFORMERS: PerformerType[] = [
  'wagner',
  'daiana',
  'aflora',
  'joint',
];

const VALID_STATUSES: JobStatus[] = [
  'draft',
  'planned',
  'in_progress',
  'completed',
  'cancelled',
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export type ValidationResult =
  | { ok: true; data: JobFormData }
  | { ok: false; error: string };

/**
 * Validates an incoming request body and converts it into a `JobFormData`
 * ready to be passed to `createJob()` or `updateJob()`.
 *
 * @param body    Raw parsed JSON from the request.
 * @param partial When true (PATCH), `title` and `job_date` are not required.
 */
export async function validateAndBuildJobFormData(
  body: unknown,
  partial = false,
): Promise<ValidationResult> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }

  const b = body as Record<string, unknown>;

  // ── Required fields ────────────────────────────────────────────
  if (!partial) {
    if (!b.title || String(b.title).trim() === '') {
      return { ok: false, error: '"title" is required and cannot be empty.' };
    }
    if (!b.job_date) {
      return {
        ok: false,
        error: '"job_date" is required (format: YYYY-MM-DD).',
      };
    }
  }

  // ── Type / format checks ───────────────────────────────────────
  if (b.title !== undefined && typeof b.title !== 'string') {
    return { ok: false, error: '"title" must be a string.' };
  }

  if (b.job_date !== undefined) {
    if (
      typeof b.job_date !== 'string' ||
      !DATE_REGEX.test(b.job_date)
    ) {
      return {
        ok: false,
        error: '"job_date" must be a string in YYYY-MM-DD format.',
      };
    }
  }

  if (
    b.performer !== undefined &&
    !VALID_PERFORMERS.includes(b.performer as PerformerType)
  ) {
    return {
      ok: false,
      error: `"performer" must be one of: ${VALID_PERFORMERS.join(', ')}.`,
    };
  }

  if (
    b.status !== undefined &&
    !VALID_STATUSES.includes(b.status as JobStatus)
  ) {
    return {
      ok: false,
      error: `"status" must be one of: ${VALID_STATUSES.join(', ')}.`,
    };
  }

  if (b.value !== undefined && typeof b.value !== 'number') {
    return { ok: false, error: '"value" must be a number.' };
  }

  if (
    b.custom_fields !== undefined &&
    (typeof b.custom_fields !== 'object' ||
      Array.isArray(b.custom_fields) ||
      b.custom_fields === null)
  ) {
    return { ok: false, error: '"custom_fields" must be a plain JSON object.' };
  }

  // ── Resolve client names/IDs ──────────────────────────────────
  let clientIds: string[] = [];
  if (Array.isArray(b.client_ids)) {
    clientIds = (b.client_ids as unknown[])
      .filter((id) => typeof id === 'string' && id.trim() !== '')
      .map((id) => (id as string).trim());
  } else if (Array.isArray(b.clients)) {
    const names = (b.clients as unknown[])
      .filter((c) => typeof c === 'string' && c.trim() !== '')
      .map((c) => (c as string).trim());
    clientIds = await resolveOrCreateClients(names);
  } else if (typeof b.client_name === 'string' && b.client_name.trim() !== '') {
    clientIds = await resolveOrCreateClients([b.client_name.trim()]);
  }

  // ── Resolve category names → IDs ───────────────────────────────
  let categoryIds: string[] = [];
  if (Array.isArray(b.categories)) {
    const names = (b.categories as unknown[])
      .filter((c) => typeof c === 'string' && c.trim() !== '')
      .map((c) => (c as string).trim());
    categoryIds = await resolveOrCreateCategories(names);
  }

  // ── Resolve tag names → IDs ────────────────────────────────────
  let tagIds: string[] = [];
  if (Array.isArray(b.tags)) {
    const names = (b.tags as unknown[])
      .filter((t) => typeof t === 'string' && t.trim() !== '')
      .map((t) => (t as string).trim().replace(/^#/, ''));
    tagIds = await resolveOrCreateTags(names);
  }

  // ── Resolve reportage links ────────────────────────────────────
  let reportageLinks: Array<{ url: string; title: string; provider?: string | null; published_date?: string | null }> | undefined = undefined;
  if (Array.isArray(b.reportage_links)) {
    reportageLinks = (b.reportage_links as unknown[])
      .filter((item): item is Record<string, unknown> | string => Boolean(item))
      .map((item) => {
        if (typeof item === 'string') {
          const meta = generateLinkMetadata(item);
          return { url: item, title: meta.title, provider: meta.provider, published_date: meta.published_date };
        }
        const url = String(item.url ?? '').trim();
        const customTitle = typeof item.title === 'string' ? item.title.trim() : '';
        const customDate = typeof item.published_date === 'string' ? item.published_date.trim() : '';
        const meta = generateLinkMetadata(url, customTitle, customDate);
        return {
          url,
          title: meta.title,
          provider: typeof item.provider === 'string' ? item.provider : meta.provider,
          published_date: meta.published_date,
        };
      })
      .filter((l) => Boolean(l.url));
  }

  // ── Build the FormData object ──────────────────────────────────
  const data: JobFormData = {
    title: String(b.title ?? '').trim(),
    client_ids: clientIds,
    client_name: String(b.client_name ?? '').trim() || undefined,
    performer: (b.performer as PerformerType) ?? 'wagner',
    job_date:
      typeof b.job_date === 'string'
        ? b.job_date
        : new Date().toISOString().split('T')[0],
    location: String(b.location ?? '').trim(),
    drive_url: String(b.drive_url ?? '').trim(),
    youtube_url: String(b.youtube_url ?? '').trim(),
    value: typeof b.value === 'number' ? b.value : 0,
    status: (b.status as JobStatus) ?? 'completed',
    description: String(b.description ?? '').trim(),
    category_ids: categoryIds,
    tag_ids: tagIds,
    custom_fields:
      typeof b.custom_fields === 'object' &&
      !Array.isArray(b.custom_fields) &&
      b.custom_fields !== null
        ? (b.custom_fields as Record<string, unknown>)
        : {},
    reportage_links: reportageLinks,
  };

  return { ok: true, data };
}

// ----------------------------------------------------------------
// Private helpers
// ----------------------------------------------------------------

/**
 * Given a list of client names, returns their database IDs.
 * Missing clients are created automatically.
 */
async function resolveOrCreateClients(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', trimmed)
      .maybeSingle();

    if (existing?.id) {
      ids.push(existing.id as string);
    } else {
      const { data: created, error } = await supabase
        .from('clients')
        .insert([{ name: trimmed }])
        .select('id')
        .single();
      if (!error && created?.id) ids.push(created.id as string);
    }
  }
  return ids;
}

/**
 * Given a list of category names, returns their database IDs.
 * If a category with that name doesn't exist yet, it is created
 * with a default indigo color so the agent never has to manage metadata.
 */
async function resolveOrCreateCategories(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const { data: existing } = await supabase
      .from('commercial_categories')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (existing?.id) {
      ids.push(existing.id as string);
    } else {
      const { data: created, error } = await supabase
        .from('commercial_categories')
        .insert([{ name, color: '#6366f1' }])
        .select('id')
        .single();
      if (!error && created?.id) ids.push(created.id as string);
    }
  }
  return ids;
}

/**
 * Given a list of tag names (without leading #), returns their database IDs.
 * Missing tags are created automatically with a default purple color.
 */
async function resolveOrCreateTags(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const { data: existing } = await supabase
      .from('job_tags')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (existing?.id) {
      ids.push(existing.id as string);
    } else {
      const { data: created, error } = await supabase
        .from('job_tags')
        .insert([{ name, color: '#8b5cf6' }])
        .select('id')
        .single();
      if (!error && created?.id) ids.push(created.id as string);
    }
  }
  return ids;
}
