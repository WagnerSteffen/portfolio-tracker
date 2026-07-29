/**
 * Route Handler: /api/utils/metadata
 *
 * GET /api/utils/metadata?url=...
 * Fetches Open Graph / HTML metadata (og:title, title, og:site_name, article:published_time)
 * from a target news URL to auto-fill title and publication date.
 */

import { type NextRequest } from 'next/server';
import { generateLinkMetadata } from '@/utils/url-title';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url')?.trim();

  if (!targetUrl) {
    return Response.json(
      { success: false, error: 'Query parameter "url" is required.' },
      { status: 400 },
    );
  }

  let formattedUrl = targetUrl;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const fallback = generateLinkMetadata(formattedUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return Response.json({ success: true, data: fallback });
    }

    const html = await res.text();

    // Extract og:title or <title>
    let title = '';
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim();
    } else {
      const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch && titleTagMatch[1]) {
        title = titleTagMatch[1].trim();
      }
    }

    // Clean html entities in title
    title = title
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'");

    // Extract og:site_name or provider
    let provider = fallback.provider;
    const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    if (ogSiteMatch && ogSiteMatch[1]) {
      provider = ogSiteMatch[1].trim();
    }

    // Extract publication date (article:published_time or datePublished)
    let published_date = fallback.published_date;
    const dateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*itemprop=["']datePublished["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/"datePublished"\s*:\s*"([^"']+)"/i);

    if (dateMatch && dateMatch[1]) {
      const dateStr = dateMatch[1].split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        published_date = dateStr;
      }
    }

    const finalTitle = title || fallback.title;

    return Response.json({
      success: true,
      data: {
        title: finalTitle,
        provider,
        published_date,
        url: formattedUrl,
      },
    });
  } catch (err) {
    // Return graceful fallback from URL analysis
    return Response.json({ success: true, data: fallback });
  }
}
