// Netlify Edge Function - OG Preview untuk Social Media Bots
// Mendeteksi bot (WhatsApp, Telegram, dll) dan mengembalikan HTML dengan OG tags yang benar
// Runtime: Deno (bukan Node.js)

const SOCIAL_BOTS = /WhatsApp|TelegramBot|facebookexternalhit|Twitterbot|Slackbot-LinkExpanding|Discordbot|LinkedInBot|Pinterest|Googlebot|bingbot|Applebot|Embedly|Quora|Slack|redditbot/i;

// Ekstensi file statis yang tidak perlu diproses
const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json|xml|txt)$/i;

export default async function (request, context) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Lewati jika bukan bot
  if (!SOCIAL_BOTS.test(userAgent)) return;

  // Lewati file statis dan route API
  if (STATIC_EXTENSIONS.test(url.pathname)) return;
  if (url.pathname.startsWith('/api/')) return;

  // URL backend untuk fetch OG data
  const apiUrl = Deno.env.get('VITE_API_URL') || 'https://api.smkkrisma.sch.id';

  try {
    const ogUrl = `${apiUrl}/og${url.pathname}`;
    const response = await fetch(ogUrl, {
      signal: AbortSignal.timeout(5000), // timeout 5 detik
      headers: { 'User-Agent': 'Netlify-OG-Bot/1.0' },
    });

    if (response.ok) {
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  } catch (_err) {
    // Kalau backend tidak tersedia, lanjutkan serve React app normal
  }

  // Fallback: serve React app (index.html dengan static OG tags)
  return;
}
