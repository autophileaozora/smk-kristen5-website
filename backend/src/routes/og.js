import express from 'express';
import Article from '../models/Article.js';
import Jurusan from '../models/Jurusan.js';
import SiteSettings from '../models/SiteSettings.js';

const router = express.Router();

const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://smkkristen5klaten.netlify.app';
const DEFAULT_DESC = 'SMK Kristen 5 Klaten (Krisma) adalah sekolah menengah kejuruan terbaik di Klaten dengan berbagai jurusan unggulan.';

const escape = (str) => String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const buildHtml = ({ title, description, image, url, type = 'website' }) => {
  const t = escape(title || 'SMK Kristen 5 Klaten');
  const d = escape(description || DEFAULT_DESC);
  const i = image || '';
  const u = url || SITE_URL;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${u}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  ${i ? `<meta property="og:image" content="${i}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${t}">` : ''}
  <meta property="og:site_name" content="SMK Kristen 5 Klaten">
  <meta property="og:locale" content="id_ID">
  <meta name="twitter:card" content="${i ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  ${i ? `<meta name="twitter:image" content="${i}">` : ''}
  <meta http-equiv="refresh" content="0;url=${u}">
</head>
<body>
  <p>Mengalihkan ke <a href="${u}">${t}</a>...</p>
</body>
</html>`;
};

// @route  GET /api/og?path=/artikel/some-slug
// @desc   Return OG meta HTML for social media bots
// @access Public
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const path = decodeURIComponent(req.query.path || '/');
    const settings = await SiteSettings.getSettings();
    const defaultImage = settings.ogImage || '';
    const siteTitle = settings.metaTitle || settings.siteName || 'SMK Kristen 5 Klaten - SMK Krisma';
    const siteDesc = settings.metaDescription || DEFAULT_DESC;

    // /artikel/:slug
    const articleMatch = path.match(/^\/artikel\/([^/?#]+)/);
    if (articleMatch) {
      const article = await Article.findOne({ slug: articleMatch[1], status: 'published' })
        .select('title excerpt featuredImage metaDescription slug');
      if (article) {
        return res.send(buildHtml({
          title: `${article.title} - SMK Kristen 5 Klaten`,
          description: article.metaDescription || article.excerpt || siteDesc,
          image: article.featuredImage || defaultImage,
          url: `${SITE_URL}/artikel/${article.slug}`,
          type: 'article',
        }));
      }
    }

    // /jurusan/:slug
    const jurusanMatch = path.match(/^\/jurusan\/([^/?#]+)/);
    if (jurusanMatch) {
      const jurusan = await Jurusan.findOne({ slug: jurusanMatch[1] })
        .select('name description backgroundImage slug');
      if (jurusan) {
        return res.send(buildHtml({
          title: `Jurusan ${jurusan.name} - SMK Kristen 5 Klaten`,
          description: jurusan.description || siteDesc,
          image: jurusan.backgroundImage || defaultImage,
          url: `${SITE_URL}/jurusan/${jurusan.slug}`,
        }));
      }
    }

    // /ekskul
    if (path.startsWith('/ekskul')) {
      return res.send(buildHtml({
        title: 'Ekstrakurikuler - SMK Kristen 5 Klaten',
        description: 'Temukan kegiatan ekstrakurikuler akademik dan non-akademik di SMK Kristen 5 Klaten.',
        image: defaultImage,
        url: `${SITE_URL}/ekskul`,
      }));
    }

    // /fasilitas
    if (path.startsWith('/fasilitas')) {
      return res.send(buildHtml({
        title: 'Fasilitas - SMK Kristen 5 Klaten',
        description: 'Fasilitas lengkap dan modern untuk mendukung kegiatan belajar mengajar di SMK Kristen 5 Klaten.',
        image: defaultImage,
        url: `${SITE_URL}/fasilitas`,
      }));
    }

    // /profil
    if (path.startsWith('/profil')) {
      return res.send(buildHtml({
        title: 'Profil Sekolah - SMK Kristen 5 Klaten',
        description: 'Sejarah dan informasi lengkap SMK Kristen 5 Klaten (Krisma).',
        image: defaultImage,
        url: `${SITE_URL}/profil`,
      }));
    }

    // /artikel (list)
    if (path.startsWith('/artikel')) {
      return res.send(buildHtml({
        title: 'Berita & Artikel - SMK Kristen 5 Klaten',
        description: 'Berita, artikel, dan informasi terkini dari SMK Kristen 5 Klaten.',
        image: defaultImage,
        url: `${SITE_URL}/artikel`,
      }));
    }

    // Homepage / fallback
    return res.send(buildHtml({
      title: siteTitle,
      description: siteDesc,
      image: defaultImage,
      url: `${SITE_URL}${path === '/' ? '' : path}`,
    }));
  } catch (error) {
    console.error('OG route error:', error);
    return res.send(buildHtml({
      title: 'SMK Kristen 5 Klaten',
      description: DEFAULT_DESC,
      url: SITE_URL,
    }));
  }
});

// @route  GET /api/og-image
// @desc   Redirect to the school's OG image (from SiteSettings)
// @access Public
router.get('/image', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    if (settings.ogImage) {
      return res.redirect(302, settings.ogImage);
    }
    // If no ogImage set, return 404 so browsers use fallback
    return res.status(404).json({ success: false, message: 'OG image not configured' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
