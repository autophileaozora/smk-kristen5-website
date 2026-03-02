import express from 'express';
import Article from '../models/Article.js';
import CustomPage from '../models/CustomPage.js';
import SiteSettings from '../models/SiteSettings.js';

const router = express.Router();

// @route   GET /og-image
// @desc    Redirect to current OG image (ogImage atau logo dari SiteSettings)
// @access  Public
router.get('/og-image', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const imageUrl = settings.ogImage || settings.logo;

    if (imageUrl) {
      res.set('Cache-Control', 'public, max-age=3600');
      return res.redirect(302, imageUrl);
    }

    res.status(404).json({ success: false, message: 'OG image belum dikonfigurasi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /favicon
// @desc    Redirect to current favicon (favicon atau logo dari SiteSettings)
// @access  Public
router.get('/favicon', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const imageUrl = settings.favicon || settings.logo;

    if (imageUrl) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 jam cache
      return res.redirect(302, imageUrl);
    }

    res.status(404).json({ success: false, message: 'Favicon belum dikonfigurasi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: build minimal HTML with OG meta tags untuk social media bots
function buildOgHtml({ title, description, image, url, type = 'website' }) {
  const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="SMK Kristen 5 Klaten">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  ${image ? `<meta property="og:image" content="${esc(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="${esc(image)}">` : ''}
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:locale" content="id_ID">
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta http-equiv="refresh" content="0;url=${esc(url)}">
</head>
<body>
  <p>Mengalihkan ke <a href="${esc(url)}">${esc(url)}</a>...</p>
</body>
</html>`;
}

// @route   GET /og/*
// @desc    Serve OG meta HTML untuk social media bots (artikel, jurusan, halaman, dll)
// @access  Public
router.get('/og/*', async (req, res) => {
  const path = req.params[0] || '';
  const siteUrl = process.env.FRONTEND_URL || 'https://smkkrisma.sch.id';

  try {
    const settings = await SiteSettings.getSettings();
    const defaultImage = settings.ogImage || settings.logo || null;

    // Default: gunakan meta dari SiteSettings
    let ogData = {
      title: settings.metaTitle || 'SMK Kristen 5 Klaten - SMK Krisma',
      description: settings.metaDescription || 'SMK Kristen 5 Klaten adalah sekolah menengah kejuruan terbaik di Klaten dengan berbagai jurusan unggulan.',
      image: defaultImage,
      url: `${siteUrl}/${path}`,
      type: 'website',
    };

    // /artikel/:slug
    if (path.startsWith('artikel/')) {
      const slug = path.replace('artikel/', '');
      const article = await Article.findOne({ slug, status: 'published' })
        .select('title metaDescription excerpt featuredImage slug');
      if (article) {
        ogData = {
          title: `${article.title} - SMK Kristen 5 Klaten`,
          description: article.metaDescription || article.excerpt || article.title,
          image: article.featuredImage?.url || defaultImage,
          url: `${siteUrl}/artikel/${article.slug}`,
          type: 'article',
        };
      }
    }

    // /jurusan/:slug
    else if (path.startsWith('jurusan/')) {
      const slug = path.replace('jurusan/', '');
      try {
        const Jurusan = (await import('../models/Jurusan.js')).default;
        const jurusan = await Jurusan.findOne({ slug })
          .select('name shortDescription description logo backgroundImage slug');
        if (jurusan) {
          ogData = {
            title: `${jurusan.name} - SMK Kristen 5 Klaten`,
            description: jurusan.shortDescription || jurusan.description || `Program keahlian ${jurusan.name} di SMK Kristen 5 Klaten`,
            image: jurusan.logo || jurusan.backgroundImage || defaultImage,
            url: `${siteUrl}/jurusan/${jurusan.slug}`,
            type: 'website',
          };
        }
      } catch (err) { /* pakai default */ }
    }

    // /page/:slug
    else if (path.startsWith('page/')) {
      const slug = path.replace('page/', '');
      const page = await CustomPage.findOne({ slug, status: 'published' })
        .select('title seo slug');
      if (page) {
        ogData = {
          title: page.seo?.metaTitle || `${page.title} - SMK Kristen 5 Klaten`,
          description: page.seo?.metaDescription || `${page.title} - SMK Kristen 5 Klaten`,
          image: page.seo?.ogImage || defaultImage,
          url: `${siteUrl}/page/${page.slug}`,
          type: 'website',
        };
      }
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300'); // 5 menit
    return res.send(buildOgHtml(ogData));
  } catch (error) {
    console.error('OG route error:', error);
    res.status(500).send('<html><body>Error generating OG preview</body></html>');
  }
});

// @route   GET /sitemap.xml
// @desc    Generate dynamic sitemap for SEO
// @access  Public
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://smkkrisma.sch.id';
    
    // Get all published articles
    const articles = await Article.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 });
    
    // Get all published custom pages
    const customPages = await CustomPage.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ updatedAt: -1 });

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { loc: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
      { loc: '/jurusan', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.9' },
      { loc: '/artikel', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.8' },
      { loc: '/fasilitas', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
      { loc: '/kontak', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
      { loc: '/sejarah', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: '0.6' },
      { loc: '/visi-misi', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: '0.6' },
      { loc: '/sambutan', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: '0.6' },
    ];

    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Jurusan pages
    try {
      const Jurusan = (await import('../models/Jurusan.js')).default;
      const jurusans = await Jurusan.find().select('slug updatedAt').lean();
      jurusans.forEach(jurusan => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/jurusan/${jurusan.slug}</loc>\n`;
        sitemap += `    <lastmod>${new Date(jurusan.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
        sitemap += '    <changefreq>monthly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      });
    } catch (err) {
      console.log('Jurusan not available for sitemap');
    }

    // Article pages
    articles.forEach(article => {
      const lastmod = new Date(article.updatedAt || article.publishedAt).toISOString().split('T')[0];
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/artikel/${article.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    // Custom pages
    customPages.forEach(page => {
      const lastmod = new Date(page.updatedAt || page.createdAt).toISOString().split('T')[0];
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/page/${page.slug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += '    <changefreq>monthly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
