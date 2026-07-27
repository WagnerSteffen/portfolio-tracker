/**
 * Ensures that an external URL has a proper protocol scheme (https:// or http://).
 * If the user inputs "drive.google.com/...", it converts it to "https://drive.google.com/..."
 * so that standard `<a href="...">` tags navigate to external sites instead of relative paths.
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
