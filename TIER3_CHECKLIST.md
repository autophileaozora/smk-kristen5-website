# SEO Tier 3 - Step-by-Step Implementation Checklist

**Purpose:** Easy-to-follow checklist for implementing each Tier 3 feature
**Status:** Ready for next AI developer
**Recommended Order:** Based on impact vs effort analysis

---

## Phase 1: Quick Wins (Week 1)

### Feature 1.1: FAQ Schema Implementation

**Objective:** Add FAQ support to articles so Google can show FAQ rich results

**Time Estimate:** 2 days

**Prerequisites:**
- [ ] Understand JSON-LD FAQ structure
- [ ] Access to MongoDB for schema update
- [ ] Familiarity with Mongoose pre-hooks

**Step 1: Update Article Model**

```javascript
// File: backend/src/models/Article.js
// Add to schema:

faqs: [{
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  _id: false
}],

faqsSchema: {
  type: String,
  enum: ['structured', 'extracted', 'none'],
  default: 'none'
}
```

**Task:** [ ] Add FAQ fields to Article schema

**Step 2: Create FAQ Validator Middleware**

```javascript
// File: backend/src/middleware/faqValidation.js

export const validateFAQs = (req, res, next) => {
  if (!req.body.faqs) {
    return next();
  }
  
  // Check each FAQ
  for (let i = 0; i < req.body.faqs.length; i++) {
    const faq = req.body.faqs[i];
    
    if (!faq.question || !faq.answer) {
      return res.status(400).json({
        success: false,
        message: `FAQ ${i + 1} missing question or answer`
      });
    }
    
    if (faq.question.length < 10 || faq.question.length > 200) {
      return res.status(400).json({
        success: false,
        message: `FAQ ${i + 1} question must be 10-200 characters`
      });
    }
    
    if (faq.answer.length < 20 || faq.answer.length > 2000) {
      return res.status(400).json({
        success: false,
        message: `FAQ ${i + 1} answer must be 20-2000 characters`
      });
    }
  }
  
  next();
};
```

**Task:** [ ] Create FAQ validation middleware

**Step 3: Update Article Routes**

```javascript
// File: backend/src/routes/articles.js
// In PUT endpoint, add:

// Update FAQs
if (req.body.faqs) {
  article.faqs = req.body.faqs.sort((a, b) => a.order - b.order);
}

// Log audit trail
if (req.body.faqs && req.body.faqs.length > 0) {
  await AuditLog.create({
    user: req.user.id,
    action: 'updated_faqs',
    resourceModel: 'Article',
    resourceId: article._id,
    changes: {
      faqCount: req.body.faqs.length
    }
  });
}
```

**Task:** [ ] Update POST and PUT endpoints to accept FAQs

**Step 4: Frontend - Add FAQ Editor**

```jsx
// File: frontend/src/pages/Articles.jsx
// Add to form state:

const [faqs, setFaqs] = useState([]);
const [showFaqModal, setShowFaqModal] = useState(false);

// Add FAQ handler
const addFAQ = () => {
  setFaqs([...faqs, { question: '', answer: '', order: faqs.length }]);
};

const updateFAQ = (index, field, value) => {
  const updated = [...faqs];
  updated[index][field] = value;
  setFaqs(updated);
};

const removeFAQ = (index) => {
  setFaqs(faqs.filter((_, i) => i !== index));
};

// Add to form submit:
formData.faqs = faqs.filter(f => f.question && f.answer);
```

**Task:** [ ] Add FAQ editor UI to admin form

**Bonus:** [ ] Add FAQ preview showing how Google will display it

```jsx
// FAQ Preview Component
<div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
  <h3 className="font-bold mb-2">How this will appear in Google:</h3>
  {faqs.map((faq, idx) => (
    <div key={idx} className="mb-4">
      <p className="font-semibold text-blue-700">{faq.question}</p>
      <p className="text-gray-700 mt-1">{faq.answer.substring(0, 100)}...</p>
    </div>
  ))}
</div>
```

**Step 5: Frontend - Add FAQ Schema**

```jsx
// File: frontend/src/pages/public/ArtikelDetail.jsx
// In Helmet component:

{article.faqs && article.faqs.length > 0 && (
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": article.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    })}
  </script>
)}
```

**Task:** [ ] Render FAQ schema in article detail page

**Testing Checklist:**
- [ ] Create article with 3+ FAQs
- [ ] Verify FAQs save to database
- [ ] Check FAQ schema in browser (Inspect → Network → XHR)
- [ ] Validate schema at https://schema.org/validator
- [ ] Test on mobile view
- [ ] Verify in Google Rich Result Tester

**Expected Result:** Google can detect FAQ sections and show them in search results

**Commit Message:**
```
feat: Tier 3 - FAQ Schema Implementation
- Add faq field to Article model
- Create FAQ validator middleware
- Add FAQ editor to admin form
- Render FAQ schema in article detail
```

---

### Feature 1.2: Breadcrumb Schema

**Objective:** Show breadcrumb navigation in Google search results

**Time Estimate:** 1 day

**Step 1: Update Frontend**

```jsx
// File: frontend/src/pages/public/ArtikelDetail.jsx

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Beranda",
      "item": window.location.origin
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Artikel",
      "item": `${window.location.origin}/artikel`
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": article.categoryTopik?.name || "Kategori",
      "item": `${window.location.origin}/artikel?topik=${article.categoryTopik?._id}`
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": article.title,
      "item": `${window.location.origin}/artikel/${article.slug}`
    }
  ]
};

// In Helmet:
<script type="application/ld+json">
  {JSON.stringify(breadcrumbSchema)}
</script>
```

**Task:** [ ] Add breadcrumb schema to article detail page

**Testing:**
- [ ] Validate schema at https://schema.org/validator
- [ ] Check Google Rich Result Tester
- [ ] Verify position numbering (1, 2, 3, 4)
- [ ] Test with different categories

**Expected Result:** Breadcrumbs appear in Google search results for this article

**Commit Message:**
```
feat: Tier 3 - Breadcrumb Schema
- Add BreadcrumbList schema to article pages
- Include category hierarchy in breadcrumbs
```

---

### Feature 1.3: Featured Snippet Optimization

**Objective:** Format selected article content as featured snippets to rank #0

**Time Estimate:** 2-3 days

**Step 1: Add Featured Snippet Support**

```javascript
// File: backend/src/models/Article.js
// Add to schema:

snippetInfo: {
  format: {
    type: String,
    enum: ['paragraph', 'list', 'table', 'none'],
    default: 'none'
  },
  content: String,
  optimized: { type: Boolean, default: false },
  lastOptimizedAt: Date
}
```

**Task:** [ ] Add snippet field to Article model

**Step 2: Create Snippet Optimizer Service**

```javascript
// File: backend/src/utils/snippetOptimizer.js

export class SnippetOptimizer {
  // Detect if content has list structure
  static hasOrderedList(htmlContent) {
    return /<ol>|<ul>/i.test(htmlContent);
  }
  
  // Detect if content has table
  static hasTable(htmlContent) {
    return /<table>/i.test(htmlContent);
  }
  
  // Extract potential snippet (first strong paragraph)
  static extractSnippet(htmlContent) {
    // Remove HTML tags for plain text
    const text = htmlContent.replace(/<[^>]*>/g, '');
    
    // Get first 40-60 words as potential snippet
    const words = text.split(/\s+/);
    if (words.length > 40) {
      return words.slice(0, 55).join(' ') + '...';
    }
    return text;
  }
  
  // Recommend format based on content
  static recommendFormat(htmlContent) {
    if (this.hasTable(htmlContent)) return 'table';
    if (this.hasOrderedList(htmlContent)) return 'list';
    return 'paragraph';
  }
}
```

**Task:** [ ] Create snippet optimizer utility

**Step 3: Add Admin UI**

```jsx
// File: frontend/src/pages/Articles.jsx
// Add snippet section to form:

<div className="bg-amber-50 p-4 rounded mb-4">
  <h3 className="font-bold text-amber-900 mb-3">Featured Snippet</h3>
  
  <div className="grid grid-cols-2 gap-3 mb-3">
    <select 
      value={formData.snippetInfo?.format || 'none'}
      onChange={(e) => setFormData({
        ...formData,
        snippetInfo: { ...formData.snippetInfo, format: e.target.value }
      })}
      className="rounded border p-2"
    >
      <option value="none">None</option>
      <option value="paragraph">Paragraph</option>
      <option value="list">List</option>
      <option value="table">Table</option>
    </select>
    
    <button
      type="button"
      onClick={() => optimizeForSnippet()}
      className="bg-amber-500 text-white px-4 py-2 rounded"
    >
      Auto-Detect Format
    </button>
  </div>
  
  <div className="bg-white p-3 rounded border-2 border-amber-200">
    <p className="text-sm text-gray-600">Preview:</p>
    <p className="text-amber-900 font-semibold">
      {formData.snippetInfo?.content || 'Content will appear here...'}
    </p>
  </div>
</div>

// Handler:
const optimizeForSnippet = () => {
  const snippetOptimizer = new SnippetOptimizer();
  const format = snippetOptimizer.recommendFormat(formData.content);
  const snippet = snippetOptimizer.extractSnippet(formData.content);
  
  setFormData({
    ...formData,
    snippetInfo: {
      format,
      content: snippet,
      optimized: true
    }
  });
};
```

**Task:** [ ] Add featured snippet UI to admin form

**Step 4: Database Migration**

```javascript
// File: backend/scripts/add-snippet-field.js

import Article from '../src/models/Article.js';

async function addSnippetField() {
  try {
    // Add snippet field to all articles
    const result = await Article.updateMany(
      {},
      { 
        $set: { 
          snippetInfo: {
            format: 'none',
            content: '',
            optimized: false
          }
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} articles`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

addSnippetField();
```

**Testing:**
- [ ] Run database migration
- [ ] Create article with featured snippet
- [ ] Verify snippet renders in search results (after indexing)
- [ ] Check format detection works (list, table, paragraph)
- [ ] Monitor Google Search Console for position 0 appearances

**Expected Result:** Article starts appearing in position 0 for target keywords

**Commit Message:**
```
feat: Tier 3 - Featured Snippet Optimization
- Add snippetInfo field to Article model
- Create snippet optimizer service
- Add snippet editor to admin form
- Enable auto-format detection for content
```

---

## Phase 2: Authority Signals (Week 2)

### Feature 2.1: Author Authority Pages

**Objective:** Create author profile pages to build E-E-A-T signals

**Time Estimate:** 3-4 days

**Step 1: Enhance User Model**

```javascript
// File: backend/src/models/User.js
// Add author fields:

authorSettings: {
  isAuthor: { type: Boolean, default: false },
  bio: { type: String, max: 500 },
  credentials: [String],  // e.g., "10+ years experience"
  specialty: [String],    // e.g., "SMK Education", "Career Guidance"
  socialLinks: {
    website: String,
    linkedin: String,
    twitter: String
  },
  articleCount: { type: Number, default: 0 },
  authorPhoto: String,
  verified: { type: Boolean, default: false }
}
```

**Task:** [ ] Add author fields to User model

**Step 2: Create Author Routes**

```javascript
// File: backend/src/routes/authors.js

import express from 'express';
import User from '../models/User.js';
import Article from '../models/Article.js';

const router = express.Router();

// Get author profile
router.get('/:slug', async (req, res) => {
  try {
    const author = await User.findOne(
      { slug: req.params.slug, 'authorSettings.isAuthor': true },
      '-password -email'  // Hide sensitive fields
    );
    
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }
    
    // Get author's latest articles
    const articles = await Article.find(
      { author: author._id, status: 'published' },
      'title slug excerpt publishedAt views'
    )
    .sort({ publishedAt: -1 })
    .limit(10);
    
    // Calculate stats
    const stats = {
      totalArticles: articles.length,
      TotalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
      averageViewsPerArticle: Math.round(
        articles.reduce((sum, a) => sum + (a.views || 0), 0) / articles.length || 0
      )
    };
    
    res.json({
      success: true,
      data: {
        author: {
          ...author.toObject(),
          stats
        },
        recentArticles: articles
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all authors
router.get('/', async (req, res) => {
  try {
    const authors = await User.find(
      { 'authorSettings.isAuthor': true },
      'name slug authorSettings.bio authorSettings.specialty authorSettings.authorPhoto'
    );
    
    res.json({ success: true, data: { authors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

**Task:** [ ] Create author routes and endpoints

**Step 3: Frontend - Author Profile Page**

```jsx
// File: frontend/src/pages/public/AuthorProfile.jsx

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';

export default function AuthorProfile() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAuthor();
  }, [slug]);
  
  const fetchAuthor = async () => {
    try {
      const response = await api.get(`/api/authors/${slug}`);
      setAuthor(response.data.data.author);
      setArticles(response.data.data.recentArticles);
    } catch (error) {
      console.error('Error fetching author:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (!author) return <div>Author not found</div>;
  
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "image": author.authorSettings?.authorPhoto,
    "description": author.authorSettings?.bio,
    "url": `${window.location.origin}/author/${author.slug}`,
    "jobTitle": author.authorSettings?.specialty?.join(", "),
    "mainEntity": {
      "@context": "https://schema.org",
      "@type": "Article",
      "author": {
        "@type": "Person",
        "name": author.name
      }
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{author.name} - SMK Kristen 5 Klaten</title>
        <meta name="description" content={author.authorSettings?.bio} />
        <script type="application/ld+json">
          {JSON.stringify(authorSchema)}
        </script>
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-8">
        {/* Author Header */}
        <div className="flex gap-6 mb-8">
          <img 
            src={author.authorSettings?.authorPhoto} 
            alt={author.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div>
            <h1 className="text-4xl font-bold">{author.name}</h1>
            {author.authorSettings?.verified && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                ✓ Verified Expert
              </span>
            )}
            <p className="text-gray-600 mt-2">{author.authorSettings?.bio}</p>
            
            {/* Credentials */}
            <div className="mt-4">
              <p className="font-semibold">Specialties:</p>
              <ul className="flex gap-2 flex-wrap">
                {author.authorSettings?.specialty?.map(spec => (
                  <li key={spec} className="bg-gray-100 px-3 py-1 rounded">
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{author.stats?.totalArticles}</p>
                <p className="text-gray-600">Articles</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{author.stats?.totalViews.toLocaleString()}</p>
                <p className="text-gray-600">Total Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{author.stats?.averageViewsPerArticle}</p>
                <p className="text-gray-600">Avg Views</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Articles */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Articles</h2>
          <div className="space-y-4">
            {articles.map(article => (
              <div key={article._id} className="border rounded p-4 hover:shadow-lg transition">
                <h3 className="font-bold text-lg">
                  <a href={`/artikel/${article.slug}`} className="text-blue-600 hover:underline">
                    {article.title}
                  </a>
                </h3>
                <p className="text-gray-600 mt-2">{article.excerpt}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-sm text-gray-500">{article.views || 0} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
```

**Task:** [ ] Create author profile page component

**Step 4: Update Article Detail to Link to Author**

```jsx
// File: frontend/src/pages/public/ArtikelDetail.jsx
// Update author section:

<div className="flex items-center gap-3 py-4 border-t border-b my-6">
  <img 
    src={article.author?.authorSettings?.authorPhoto || '/default-avatar.png'}
    alt={article.author?.name}
    className="w-12 h-12 rounded-full"
  />
  <div>
    <p className="text-sm text-gray-600">By</p>
    <a 
      href={`/author/${article.author?.slug}`}
      className="font-bold text-blue-600 hover:underline"
    >
      {article.author?.name}
    </a>
    {article.author?.authorSettings?.specialty && (
      <p className="text-sm text-gray-600">
        {article.author.authorSettings.specialty.join(", ")}
      </p>
    )}
  </div>
</div>
```

**Task:** [ ] Update article detail to show author info and link to profile

**Step 5: Add Route**

```javascript
// File: frontend/src/App.jsx
// Add route:

import AuthorProfile from './pages/public/AuthorProfile';

// In routes:
<Route path="/author/:slug" element={<AuthorProfile />} />
```

**Task:** [ ] Add author route to frontend router

**Testing:**
- [ ] Create author profile with credentials
- [ ] Verify author schema renders
- [ ] Check author page in Google Search Console
- [ ] Verify "by [author]" link works on article
- [ ] Test author statistics calculations
- [ ] Monitor author page indexing

**Expected Result:** Author pages rank and improve E-E-A-T signals

**Commit Message:**
```
feat: Tier 3 - Author Authority Pages
- Add author fields to User model
- Create /api/authors endpoints
- Create author profile pages
- Link articles to author profiles
- Add Person + Article schema
```

---

## Phase 3: Technical Foundation (Week 3)

### Feature 3.1: Search Console Integration

**Objective:** Monitor keyword rankings and indexing status programmatically

**Time Estimate:** 4-5 days

**Step 1: Setup Google Search Console API**

```bash
# Prerequisites:
# 1. Create Google Cloud project
# 2. Enable Google Search Console API
# 3. Create service account
# 4. Download credentials.json
# 5. Add service account email as owner in Search Console
```

**Task:** [ ] Follow Google Cloud setup steps

**Step 2: Create Search Console Service**

```javascript
// File: backend/src/services/searchConsoleService.js

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export class SearchConsoleService {
  constructor() {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters']
    });
    
    this.webmasters = google.webmasters({
      version: 'v3',
      auth: this.auth
    });
    
    this.siteUrl = `https://${process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL}`;
  }
  
  async getSearchAnalytics(days = 28) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const response = await this.webmasters.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['query', 'page'],
          rowLimit: 25000
        }
      });
      
      return response.data.rows || [];
    } catch (error) {
      console.error('Search Console error:', error);
      throw error;
    }
  }
  
  async getTopQueries(limit = 10) {
    const data = await this.getSearchAnalytics();
    return data
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit)
      .map(row => ({
        query: row.keys[0],
        page: row.keys[1],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
  }
  
  async getTopPages(limit = 10) {
    const data = await this.getSearchAnalytics();
    const pageData = {};
    
    data.forEach(row => {
      const page = row.keys[1];
      if (!pageData[page]) {
        pageData[page] = { clicks: 0, impressions: 0, position: 0, count: 0 };
      }
      pageData[page].clicks += row.clicks;
      pageData[page].impressions += row.impressions;
      pageData[page].position += row.position;
      pageData[page].count += 1;
    });
    
    // Convert to array and sort
    return Object.entries(pageData)
      .map(([page, stats]) => ({
        page,
        clicks: stats.clicks,
        impressions: stats.impressions,
        avgPosition: (stats.position / stats.count).toFixed(1),
        ctr: (stats.clicks / stats.impressions * 100).toFixed(2) + '%'
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }
}
```

**Task:** [ ] Create Search Console service

**Step 3: Create Analytics Routes**

```javascript
// File: backend/src/routes/seoAnalytics.js

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { SearchConsoleService } from '../services/searchConsoleService.js';

const router = express.Router();
const searchConsole = new SearchConsoleService();

// Get top queries
router.get('/top-queries', authenticate, authorize('administrator'), async (req, res) => {
  try {
    const days = req.query.days || 28;
    const queries = await searchConsole.getTopQueries(days);
    
    res.json({
      success: true,
      data: { queries }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get top pages
router.get('/top-pages', authenticate, authorize('administrator'), async (req, res) => {
  try {
    const pages = await searchConsole.getTopPages();
    
    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

**Task:** [ ] Create SEO analytics routes

**Step 4: Frontend - SEO Dashboard**

```jsx
// File: frontend/src/pages/admin/SEOAnalytics.jsx

import { useEffect, useState } from 'react';
import api from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SEOAnalytics() {
  const [topQueries, setTopQueries] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(28);
  
  useEffect(() => {
    fetchAnalytics();
  }, [days]);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [queriesRes, pagesRes] = await Promise.all([
        api.get(`/api/seo/top-queries?days=${days}`),
        api.get(`/api/seo/top-pages`)
      ]);
      
      setTopQueries(queriesRes.data.data.queries);
      setTopPages(pagesRes.data.data.pages);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">SEO Analytics</h1>
      
      {/* Date Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 28, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded ${
              days === d 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Queries */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Top Search Queries</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Query</th>
                  <th className="text-right p-2">Clicks</th>
                  <th className="text-right p-2">Impressions</th>
                  <th className="text-right p-2">Position</th>
                </tr>
              </thead>
              <tbody>
                {topQueries.map((q, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{q.query}</td>
                    <td className="text-right p-2 font-bold">{q.clicks}</td>
                    <td className="text-right p-2">{q.impressions}</td>
                    <td className="text-right p-2">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Top Pages */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Top Pages</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Page</th>
                  <th className="text-right p-2">Clicks</th>
                  <th className="text-right p-2">CTR</th>
                  <th className="text-right p-2">Avg Position</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 truncate text-xs">{p.page}</td>
                    <td className="text-right p-2 font-bold">{p.clicks}</td>
                    <td className="text-right p-2">{p.ctr}</td>
                    <td className="text-right p-2">{p.avgPosition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Note */}
      <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Data updates daily from Google Search Console. 
          May take 24-48 hours to see latest changes.
        </p>
      </div>
    </div>
  );
}
```

**Task:** [ ] Create SEO analytics dashboard

**Step 5: Add to Admin Routes**

```jsx
// File: frontend/src/App.jsx
// Add route:

import SEOAnalytics from './pages/admin/SEOAnalytics';

// In admin routes:
<Route path="/admin/seo-analytics" element={<SEOAnalytics />} />
```

**Task:** [ ] Add analytics route to admin

**Testing:**
- [ ] Verify Google credentials are valid
- [ ] Check top queries are populated
- [ ] Check top pages are populated
- [ ] Test date filtering (7, 28, 90 days)
- [ ] Monitor refresh rate

**Expected Result:** SEO dashboard shows live data from Google Search Console

**Commit Message:**
```
feat: Tier 3 - Search Console Integration
- Create SearchConsoleService for Google API
- Add /api/seo/top-queries and /api/seo/top-pages endpoints
- Create SEO Analytics dashboard
- Display top keywords and pages
```

---

## Phase 4: Performance Tracking (Week 4)

### Feature 4.1: Core Web Vitals Monitoring

**Objective:** Track page speed metrics and improve Core Web Vitals

**Time Estimate:** 3-4 days

**Step 1: Setup Web Vitals Library**

```bash
# At frontend root:
npm install web-vitals
```

**Step 2: Create Vitals Service**

```javascript
// File: frontend/src/services/vitalsService.js

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export const trackWebVitals = (onPerfEntry) => {
  getCLS(onPerfEntry);
  getFID(onPerfEntry);
  getFCP(onPerfEntry);
  getLCP(onPerfEntry);
  getTTFB(onPerfEntry);
};

export const sendVitalsToAnalytics = async (metric) => {
  // Send to backend for analysis
  await fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      url: window.location.pathname,
      timestamp: new Date().toISOString()
    }),
    headers: { 'Content-Type': 'application/json' }
  });
};
```

**Task:** [ ] Setup web vitals tracking

**Step 3: Backend - Store Core Web Vitals**

```javascript
// File: backend/src/models/CoreWebVital.js

import mongoose from 'mongoose';

const coreWebVitalSchema = new mongoose.Schema({
  url: String,
  metric: {
    name: String, // CLS, FID, FCP, LCP, TTFB
    value: Number,
    rating: String, // good, needs-improvement, poor
    delta: Number
  },
  userAgent: String,
  createdAt: { type: Date, default: Date.now, index: true, expires: 86400 * 30 } // 30 day TTL
});

export default mongoose.model('CoreWebVital', coreWebVitalSchema);
```

**Task:** [ ] Create CoreWebVital model

**Continue with Step 4...**

(This would continue with routes, frontend components, etc. - truncating for length)

---

## Implementation Priority Matrix

**Priority 1 (Do First - High Impact, Low Effort):**
- [ ] FAQ Schema
- [ ] Breadcrumb Schema
- [ ] Author Authority Pages

**Priority 2 (Do Next - Medium Impact, Medium Effort):**
- [ ] Featured Snippet Optimization
- [ ] Search Console Integration

**Priority 3 (Do After - Lower Priority):**
- [ ] Core Web Vitals Monitoring
- [ ] Image Optimization Pipeline
- [ ] Advanced Content Clustering

---

## Quick Command Reference

```bash
# Run database migrations
node backend/scripts/add-faq-field.js
node backend/scripts/add-snippet-field.js

# Test API endpoints
curl http://localhost:8000/api/articles
curl http://localhost:8000/api/authors

# Validate schemas
# Visit: https://schema.org/validator
# Paste article URL there

# Monitor in Google Search Console
# Wait 2-4 weeks for indexing after changes
```

---

## Success Criteria Checklist

- [ ] All FAQ articles show in Google rich results
- [ ] Author pages rank for "author name" queries
- [ ] Featured snippets capture position 0 for target keywords
- [ ] SEO dashboard displays real Search Console data
- [ ] Core Web Vitals improve (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Sitemap includes all new pages
- [ ] robots.txt updated with new routes
- [ ] All implemented features have been A/B tested or manually validated

---

## Resources & Tools

- Google Search Console: https://search.google.com/search-console
- Schema Validator: https://schema.org/validator
- Google Rich Results Test: https://search.google.com/test/rich-results
- Google PageSpeed Insights: https://pagespeed.web.dev
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Screaming Frog SEO Spider: https://www.screamingfrog.co.uk/seo-spider/

---

**Document Version:** 1.0
**Last Updated:** February 24, 2044
**Next Reviewer Should Start With:** Feature 1.1 - FAQ Schema Implementation
