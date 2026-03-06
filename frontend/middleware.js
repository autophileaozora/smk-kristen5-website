/**
 * Vercel Edge Middleware
 * Intercepts social media bot requests and serves pre-populated OG meta HTML
 * from the backend instead of the bare React SPA shell.
 */

export const config = {
  // Run on all routes except static assets, API paths, and Vite internals
  matcher: ['/((?!_next|assets|favicon|robots|sitemap|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|map)).*)'],
};

const BOT_PATTERN = /facebookexternalhit|facebookbot|twitterbot|whatsapp|telegrambot|slackbot|discordbot|linkedinbot|pinterestbot|googlebot|bingbot|applebot|duckduckbot|msnbot|yandexbot|baiduspider|ia_archiver|curl\/|python-requests|Wget/i;

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Only intercept known social media / crawler bots
  if (!BOT_PATTERN.test(userAgent)) {
    return; // Regular browser — pass through to SPA
  }

  const url = new URL(request.url);
  const path = url.pathname + url.search;

  // Skip bots on admin paths
  if (path.startsWith('/admin')) {
    return;
  }

  const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL || 'http://localhost:5001';

  try {
    const ogRes = await fetch(
      `${backendUrl}/api/og?path=${encodeURIComponent(path)}`,
      {
        headers: { 'User-Agent': 'SMK-Krisma-OG-Fetcher/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!ogRes.ok) return; // Fallback to SPA on backend error

    const html = await ogRes.text();
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return; // Network error — fall through to SPA
  }
}
