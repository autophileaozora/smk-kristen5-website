# SEO Implementation - Code Reference & Quick Start

**Purpose:** Quick reference for developers continuing Tier 3 implementation
**Format:** Copy-paste ready code snippets with explanations

---

## Quick Links

- [Article Model Reference](#article-model-reference)
- [Backend Endpoint Examples](#backend-endpoint-examples)
- [Frontend Implementation Examples](#frontend-implementation-examples)
- [Database Updates Required](#database-updates-required)
- [Environment Variables](#environment-variables)
- [Useful Queries](#useful-mongo-queries)

---

## Article Model Reference

### Current Schema (As of Tier 2)

```javascript
// File: backend/src/models/Article.js
{
  title: String (required, max 200),
  slug: String (unique, auto-generated),
  content: String (required, HTML),
  excerpt: String (auto-generated from content),
  
  // SEO Fields (Tier 1)
  metaDescription: String (max 160),
  keywords: [String],
  altText: String (max 125),
  
  // Category & Metadata
  categoryJurusan: ObjectId ref Jurusan,
  categoryTopik: ObjectId ref Category,
  featuredImage: { url: String, publicId: String },
  
  // Publishing
  status: String (enum: draft/pending/published/rejected),
  author: ObjectId ref User,
  approvedBy: ObjectId ref User,
  publishedAt: Date,
  
  // Engagement
  views: Number (default: 0),
  tags: [String],
  
  timestamps: true  // createdAt, updatedAt
}
```

### For Tier 3 - Add These Fields

```javascript
// Add to schema:

faqs: [{
  question: String,
  answer: String,
  _id: false
}],

// For featured snippet optimization
contentStructure: {
  hasOrderedList: Boolean,
  hasTable: Boolean,
  hasParagraphSummary: Boolean,
  snippetFormat: String (enum: paragraph/list/table/definition)
},

// Author enhancement
authorBio: String,
authorCredentials: [String],  // e.g., "10+ years SMK teacher"

// Analytics
engagement: {
  avgTimeOnPage: Number,
  scrollDepth: Number,
  internalLinkClicks: Number,
  externalLinkClicks: Number
}
```

---

## Backend Endpoint Examples

### 1. Create Article with SEO Fields

```bash
# Request
POST /api/articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Cara Memilih Jurusan SMK yang Tepat",
  "content": "<h2>Pendahuluan</h2><p>...</p>",
  "excerpt": "Panduan lengkap memilih jurusan...",
  "metaDescription": "Panduan lengkap memilih jurusan SMK yang sesuai minat dan bakat. Tips dari expert.",
  "keywords": ["jurusan SMK", "tips memilih", "prospek kerja"],
  "altText": "Siswa SMK berdiskusi tentang pilihan jurusan",
  "categoryTopik": "507f1f77bcf86cd799439011",
  "categoryJurusan": "507f1f77bcf86cd799439012",
  "featuredImage": "https://...",
  "status": "draft"
}

# Response
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "article": {
      "_id": "...",
      "slug": "cara-memilih-jurusan-smk-yang-tepat",
      "metaDescription": "Panduan lengkap...",
      "keywords": ["jurusan SMK", "tips memilih", "prospek kerja"],
      ...
    }
  }
}
```

### 2. Get Related Articles

```bash
# Request
GET /api/articles/507f1f77bcf86cd799439011/related

# Response
{
  "success": true,
  "data": {
    "articles": [
      {
        "_id": "...",
        "slug": "prospek-kerja-tkj",
        "title": "Prospek Kerja Teknik Komputer & Jaringan",
        "excerpt": "...",
        "metaDescription": "...",
        "keywords": [...],
        "featuredImage": { "url": "..." }
      },
      // ... max 5 items
    ]
  }
}
```

### 3. Search Keywords

```bash
# Request
GET /api/articles/search/keywords?q=SMK

# Response
{
  "success": true,
  "data": {
    "articles": [
      {
        "_id": "...",
        "slug": "cara-memilih-jurusan-smk",
        "title": "Cara Memilih Jurusan SMK",
        "excerpt": "..."
      },
      // ... max 10 items
    ]
  }
}
```

### 4. Dynamic Sitemap

```bash
# Request
GET /sitemap.xml

# Response (XML)
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://smk-kristen5.sch.id/artikel/cara-memilih-jurusan-smk</loc>
    <lastmod>2024-02-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- ... more URLs -->
</urlset>
```

---

## Frontend Implementation Examples

### 1. Render SEO Meta Tags

```jsx
// File: frontend/src/pages/public/ArtikelDetail.jsx

import { Helmet } from 'react-helmet-async';

export default function ArtikelDetail() {
  const [article, setArticle] = useState(null);
  
  // ... fetch article logic
  
  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/artikel/${article.slug}`;
  const metaDescription = article.metaDescription || article.excerpt;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.featuredImage?.url,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Person",
      "name": article.author?.name
    },
    "description": metaDescription,
    "publisher": {
      "@type": "Organization",
      "name": "SMK Kristen 5 Klaten"
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{article.title} | SMK Kristen 5 Klaten</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={article.keywords?.join(", ")} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={article.featuredImage?.url} />
        <meta property="article:published_time" content={article.publishedAt} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={article.title} />
        <meta property="twitter:description" content={metaDescription} />
        
        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      {/* Rest of component */}
    </>
  );
}
```

### 2. Add FAQ Schema (Tier 3)

```jsx
// Add to article JSON-LD schema:

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": article.faqs?.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  })) || []
};

// In Helmet:
<script type="application/ld+json">
  {JSON.stringify(faqSchema)}
</script>
```

### 3. Breadcrumb Schema (Tier 3)

```jsx
// Add to article JSON-LD schema:

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${baseUrl}`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Artikel",
      "item": `${baseUrl}/artikel`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": article.title,
      "item": canonicalUrl
    }
  ]
};
```

### 4. Related Articles Component

```jsx
// File: frontend/src/pages/public/ArtikelDetail.jsx

useEffect(() => {
  if (article) {
    fetchRelatedArticles();
  }
}, [article, slug]);

const fetchRelatedArticles = async () => {
  try {
    // Use smart endpoint
    const response = await api.get(`/api/articles/${article._id}/related`);
    setRelatedArticles(response.data.data.articles || []);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    // Fallback: fetch publicly
    try {
      const response = await api.get(`/api/articles/public?limit=10`);
      const filtered = response.data.data.articles.filter(
        a => a._id !== article._id && 
             article.categoryTopik?._id === a.categoryTopik?._id
      );
      setRelatedArticles(filtered.slice(0, 3));
    } catch (err) {
      console.error('Fallback error:', err);
    }
  }
};
```

---

## Database Updates Required

### MongoDB Migration Scripts

#### For FAQ Support

```javascript
// File: backend/scripts/add-faq-field.js
// Run: node scripts/add-faq-field.js

import mongoose from 'mongoose';
import Article from '../src/models/Article.js';

async function addFaqField() {
  try {
    // Add faqs array to all existing articles
    const result = await Article.updateMany(
      {},
      { $set: { faqs: [] } }
    );
    console.log(`Updated ${result.modifiedCount} articles`);
  } catch (error) {
    console.error('Migration error:', error);
  }
}

addFaqField();
```

#### For Author Enhancement

```javascript
// File: backend/scripts/enhance-user-model.js

// In User model, add:
authorBio: String,
authorCredentials: [String],
authorPhoto: String,
author Settings: {
  isAuthor: { type: Boolean, default: false },
  publicBio: String
}

// Migration
const result = await User.updateMany(
  { role: 'administrator' },
  { $set: { authorSettings: { isAuthor: true } } }
);
```

---

## Environment Variables

### Backend (.env)

```
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/database

# Server
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://smk-kristen5.sch.id

# Email (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google APIs (for Tier 3)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://smk-kristen5.sch.id

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Frontend (.env)

```
VITE_API_URL=https://api.smk-kristen5.sch.id
VITE_APP_NAME=SMK Kristen 5 Klaten
VITE_APP_DESCRIPTION=Sekolah menengah kejuruan terbaik di Klaten
```

---

## Useful Mongo Queries

### Find Articles Without MetaDescription

```javascript
db.articles.find({ metaDescription: { $exists: false } }).count()
```

### Find Articles Without Keywords

```javascript
db.articles.find({ 
  keywords: { $exists: false } 
}).count()
```

### Update Slug to Remove Timestamp

```javascript
// For old articles that have timestamp in slug
db.articles.updateMany(
  { slug: { $regex: /.*-[0-9]{13}$/ } },
  [
    { $set: { 
      slug: { $substr: [{ $concat: ["$slug"] }, 0, { $subtract: [{ $strLenCP: "$slug" }, 14] }] }
    }}
  ]
)
```

### Get Top 10 Most Viewed Articles

```javascript
db.articles.find({ status: "published" })
  .sort({ views: -1 })
  .limit(10)
```

### Get Recent Articles (Last 30 Days)

```javascript
db.articles.find({
  status: "published",
  publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
}).sort({ publishedAt: -1 })
```

### Get Articles by Category

```javascript
db.articles.find({
  categoryTopik: ObjectId("507f1f77bcf86cd799439011")
}).sort({ publishedAt: -1 })
```

---

## Testing Queries

### Test Article Creation

```javascript
// Backend test
const testArticle = {
  title: "Test SEO Article",
  content: "<p>This is test content</p>",
  excerpt: "Test excerpt",
  metaDescription: "This is a test meta description",
  keywords: ["test", "seo"],
  altText: "Test image alt text",
  author: ObjectId("user-id"),
  status: "draft"
};

// POST /api/articles with above data
```

### Validate Sitemap

```javascript
// Check if article appears in sitemap
// 1. Create + publish article

// 2. Visit /sitemap.xml

// 3. Search for article slug in XML

// 4. Verify URL format and metadata
```

### Test Related Articles

```javascript
// 1. Create 2 articles with same categoryTopik
// 2. GET /api/articles/{first-article-id}/related
// 3. Verify second article appears in results
```

---

## Common Git Commands for Reference

```bash
# Clear recent changes and start fresh
git stash
git pull origin main

# Commit SEO changes
git add .
git commit -m "feat: SEO Tier 2 - Dynamic sitemap and internal linking"
git push origin feature/seo-tier-2

# Branch for Tier 3
git checkout -b feature/seo-tier-3
# ... make changes ...
git commit -m "feat: SEO Tier 3 - FAQ schema and featured snippets"
git push origin feature/seo-tier-3
```

---

## Performance Optimization Tips

### Image Optimization

```jsx
// Use responsive images
<img 
  src={image.url} 
  alt={altText}
  loading="lazy"
  srcSet={`
    ${image.url}?w=320 320w,
    ${image.url}?w=640 640w,
    ${image.url}?w=1080 1080w
  `}
  sizes="(max-width: 320px) 100vw, (max-width: 768px) 80vw, 100vw"
/>
```

### Code Splitting

```jsx
// Lazy load heavy components
const ArticleForm = lazy(() => import('./ArticleForm'));
const SEOAnalytics = lazy(() => import('./SEOAnalytics'));

// In render
<Suspense fallback={<Loading />}>
  <ArticleForm />
</Suspense>
```

### Caching Strategy

```javascript
// Service Worker cache
const CACHE_VERSION = 'v1-seo-2024';
const URLS_TO_CACHE = [
  '/',
  '/artikel',
  '/manifest.json'
];

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

---

## Debugging Tips

### Check Meta Tags in Browser

```javascript
// Open browser console
document.head.querySelectorAll('meta').forEach(meta => {
  console.log(meta.getAttribute('name') || meta.getAttribute('property'), meta.getAttribute('content'));
});
```

### Validate JSON-LD

```javascript
// Paste URL here: https://schema.org/validator
// Or use Google's Rich Result Tester
// Check for errors in schema formatting
```

### Monitor API Calls

```javascript
// Browser console
// Network tab → Filter by XHR
// Check /api/articles responses
// Verify data structure matches expected format
```

### Check Search Console

```
1. Go to Google Search Console
2. Inspect URL (test live URL)
3. View mobile/desktop crawl result
4. Check extracted information
5. See indexing status
```

---

## Next Steps Checklist

- [ ] Review all files in SEO_IMPLEMENTATION_GUIDE.md
- [ ] Understand current database schema (Article.js)
- [ ] Test existing endpoints locally
- [ ] Read through Tier 3 implementation guide
- [ ] Choose priority features to implement next
- [ ] Setup development environment
- [ ] Start with FAQ Schema (easiest Tier 3 feature)
- [ ] Deploy and test in staging
- [ ] Deploy to production
- [ ] Monitor in Google Search Console

---

**Document Version:** 1.0
**Last Updated:** February 24, 2026
