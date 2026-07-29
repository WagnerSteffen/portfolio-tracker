/**
 * Route Handler: /api/jobs/[id]
 *
 * GET   /api/jobs/:id  → fetch a single job by UUID
 * PATCH /api/jobs/:id  → partially update a job (merge with existing data)
 *
 * DELETE is intentionally not exposed — deletions must be done through
 * the web UI as a security measure.
 *
 * All requests require:
 *   Authorization: Bearer <PORTFOLIO_API_KEY>
 */

import { type NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
import { validateAndBuildJobFormData } from '@/lib/api/validate-job';
import { getJobs, updateJob } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';

// ----------------------------------------------------------------
// GET /api/jobs/:id
// ----------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = checkAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const jobs = await getJobs();
    const job = jobs.find((j) => j.id === id);

    if (!job) {
      return Response.json(
        { success: false, error: `Job with id "${id}" not found.` },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: job });
  } catch (err) {
    console.error(`[GET /api/jobs/${id}]`, err);
    return Response.json(
      { success: false, error: 'Failed to fetch the job.' },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------
// PATCH /api/jobs/:id
// ----------------------------------------------------------------

/**
 * Partial update: the agent only needs to send the fields that changed.
 * Existing field values are fetched first and merged with the patch body
 * so the updateJob() function always receives a complete JobFormData.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = checkAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // Parse JSON patch body
  let patch: unknown;
  try {
    patch = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  // Load existing job to merge
  let jobs;
  try {
    jobs = await getJobs();
  } catch (err) {
    console.error(`[PATCH /api/jobs/${id}] getJobs failed`, err);
    return Response.json(
      { success: false, error: 'Failed to fetch existing jobs.' },
      { status: 500 },
    );
  }

  const existing = jobs.find((j) => j.id === id);
  if (!existing) {
    return Response.json(
      { success: false, error: `Job with id "${id}" not found.` },
      { status: 404 },
    );
  }

  // Merge: existing values act as defaults; patch fields override them.
  // Categories and tags are passed as name arrays so the validator can
  // resolve them the same way as on POST.
  const merged = {
    title: existing.title,
    client_name: existing.client_name ?? '',
    performer: existing.performer,
    job_date: existing.job_date,
    location: existing.location ?? '',
    drive_url: existing.drive_url ?? '',
    youtube_url: existing.youtube_url ?? '',
    value: existing.value ?? 0,
    status: existing.status,
    description: existing.description ?? '',
    // Convert current relations back to names for the validator
    categories: existing.categories?.map((c) => c.name) ?? [],
    tags: existing.tags?.map((t) => t.name) ?? [],
    custom_fields: existing.custom_fields ?? {},
    // Spread the patch on top — agent fields override existing ones
    ...(patch as Record<string, unknown>),
  };

  // Validate the merged body (partial=true: title/job_date not required)
  const validation = await validateAndBuildJobFormData(merged, true);
  if (!validation.ok) {
    return Response.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  try {
    const updated = await updateJob(id, validation.data);
    return Response.json({ success: true, data: updated });
  } catch (err) {
    console.error(`[PATCH /api/jobs/${id}]`, err);
    return Response.json(
      { success: false, error: 'Failed to update the job.' },
      { status: 500 },
    );
  }
}
