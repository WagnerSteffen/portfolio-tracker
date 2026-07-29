/**
 * Server-side API authentication helper.
 *
 * Usage in a route handler:
 *   const auth = checkAuth(request);
 *   if (!auth.ok) return auth.response;
 */

/**
 * Reads the `Authorization: Bearer <token>` header from the request and
 * validates it against the `PORTFOLIO_API_KEY` environment variable.
 *
 * Returns a discriminated union:
 *   { ok: true }                          — request is authenticated
 *   { ok: false; response: Response }     — caller should return this response
 */
export function checkAuth(
  request: Request,
): { ok: true } | { ok: false; response: Response } {
  const expectedKey = process.env.PORTFOLIO_API_KEY ?? '';

  if (!expectedKey) {
    // Misconfiguration — fail closed
    return {
      ok: false,
      response: Response.json(
        { success: false, error: 'API key not configured on server.' },
        { status: 500 },
      ),
    };
  }

  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (token !== expectedKey) {
    return {
      ok: false,
      response: Response.json(
        { success: false, error: 'Unauthorized. Provide a valid Bearer token.' },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}
