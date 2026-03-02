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
