/**
 * Helper to auto-generate provider names, link titles, and extract dates from news/media URLs.
 */

interface DomainProviderInfo {
  name: string;
  badgeColor: string; // Tailwind color classes for badges
}

const KNOWN_PROVIDERS: Record<string, DomainProviderInfo> = {
  'g1.globo.com': { name: 'G1', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30' },
  'oglobo.globo.com': { name: 'O Globo', badgeColor: 'bg-blue-600/10 text-blue-500 border-blue-600/30' },
  'globo.com': { name: 'Globo', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'nsctotal.com.br': { name: 'NSC Total', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  'ndmais.com.br': { name: 'ND+', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  'folha.uol.com.br': { name: 'Folha de S.Paulo', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  'uol.com.br': { name: 'UOL', badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
  'estadao.com.br': { name: 'Estadão', badgeColor: 'bg-blue-700/10 text-blue-400 border-blue-700/30' },
  'gzh.clicrbs.com.br': { name: 'GZH', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  'cnnbrasil.com.br': { name: 'CNN Brasil', badgeColor: 'bg-red-600/10 text-red-400 border-red-600/30' },
  'metropoles.com': { name: 'Metrópoles', badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
  'instagram.com': { name: 'Instagram', badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' },
  'facebook.com': { name: 'Facebook', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'youtube.com': { name: 'YouTube', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30' },
  'youtu.be': { name: 'YouTube', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30' },
  'medium.com': { name: 'Medium', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  'linkedin.com': { name: 'LinkedIn', badgeColor: 'bg-sky-600/10 text-sky-400 border-sky-600/30' },
};

/**
 * Extracts provider name from hostname.
 */
export function getProviderInfo(hostnameOrUrl: string): DomainProviderInfo {
  let domain = hostnameOrUrl.trim().toLowerCase();
  try {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      domain = new URL(domain).hostname;
    }
  } catch {
    // Keep raw string if URL parsing fails
  }

  domain = domain.replace(/^www\./, '');

  for (const [knownDomain, info] of Object.entries(KNOWN_PROVIDERS)) {
    if (domain === knownDomain || domain.endsWith('.' + knownDomain)) {
      return info;
    }
  }

  // Format generic hostname (e.g. portalcatarina.com.br -> Portalcatarina)
  const parts = domain.split('.');
  const rawName = parts.length > 2 && parts[parts.length - 2].length > 3
    ? parts[parts.length - 2]
    : parts[0] || 'Web';

  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  return {
    name: formattedName,
    badgeColor: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  };
}

/**
 * Tries to extract a publication date (YYYY-MM-DD) from URL paths.
 * Examples: /2026/05/10/, /2026-05-10/, /noticia-10-05-2026
 */
export function extractDateFromUrl(url: string): string | null {
  try {
    // Regex for YYYY/MM/DD or YYYY-MM-DD
    const matchYMD = url.match(/(?:^|\/|-)(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])(?:$|\/|-|\.)/);
    if (matchYMD) {
      return `${matchYMD[1]}-${matchYMD[2]}-${matchYMD[3]}`;
    }
    // Regex for DD-MM-YYYY or DD/MM/YYYY
    const matchDMY = url.match(/(?:^|\/|-)(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/](20\d{2})(?:$|\/|-|\.)/);
    if (matchDMY) {
      return `${matchDMY[3]}-${matchDMY[2]}-${matchDMY[1]}`;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Autogenerates a title and provider for a reportage link.
 */
export function generateLinkMetadata(
  url: string,
  userTitle?: string,
  userDate?: string
): { title: string; provider: string; published_date?: string | null } {
  const providerInfo = getProviderInfo(url);
  const provider = providerInfo.name;

  let title = userTitle?.trim() || '';

  if (!title) {
    // Try slug extraction from URL
    try {
      const parsed = new URL(url);
      const pathSegments = parsed.pathname.split('/').filter(Boolean);

      // Find segment that looks like a title slug (contains words separated by hyphens)
      const slugSegment = pathSegments
        .reverse()
        .find((seg) => seg.includes('-') && seg.length > 10 && !seg.endsWith('.ghtml') && !seg.endsWith('.html'));

      if (slugSegment) {
        const cleanSlug = slugSegment
          .replace(/\.(ghtml|html|php|aspx?)$/i, '')
          .replace(/[-_]+/g, ' ')
          .trim();

        if (cleanSlug.length > 5) {
          const capitalized = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
          title = `${capitalized} — ${provider}`;
        }
      }
    } catch {
      // ignore
    }

    if (!title) {
      title = `Matéria em ${provider}`;
    }
  }

  const published_date = userDate?.trim() || extractDateFromUrl(url) || null;

  return {
    title,
    provider,
    published_date,
  };
}
