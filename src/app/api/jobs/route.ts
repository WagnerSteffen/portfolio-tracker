/**
 * Route Handler: /api/jobs
 *
 * GET  /api/jobs  → list all jobs
 * POST /api/jobs  → create a new job
 *
 * All requests require:
 *   Authorization: Bearer <PORTFOLIO_API_KEY>
 *   Content-Type: application/json  (POST only)
 */

import { type NextRequest } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
import { validateAndBuildJobFormData } from '@/lib/api/validate-job';
import { getJobs, createJob } from '@/lib/supabase/api';

// Force dynamic rendering — this route calls Supabase on every request
export const dynamic = 'force-dynamic';

// ----------------------------------------------------------------
// GET /api/jobs
// ----------------------------------------------------------------

export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const jobs = await getJobs();
    return Response.json({ success: true, data: jobs, count: jobs.length });
  } catch (err) {
    console.error('[GET /api/jobs]', err);
    return Response.json(
      { success: false, error: 'Failed to fetch jobs from the database.' },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------
// POST /api/jobs
// ----------------------------------------------------------------

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.ok) return auth.response;

  // Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  // Validate and normalize
  const validation = await validateAndBuildJobFormData(body, false);
  if (!validation.ok) {
    return Response.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  // Persist
  try {
    const job = await createJob(validation.data);
    return Response.json({ success: true, data: job }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/jobs]', err);
    return Response.json(
      { success: false, error: 'Failed to save the job to the database.' },
      { status: 500 },
    );
  }
}
